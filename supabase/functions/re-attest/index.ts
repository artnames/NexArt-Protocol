import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { normalizeForAttestation } from "../_shared/normalize-for-attestation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function jsonResp(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResp({ ok: false, error: 'AUTH', message: 'Missing auth token' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return jsonResp({ ok: false, error: 'AUTH', message: 'Invalid token' }, 401);
    }

    const body = await req.json();
    const usageEventId = Number(body.usageEventId);
    if (!usageEventId || isNaN(usageEventId)) {
      return jsonResp({ ok: false, error: 'VALIDATION', message: 'Missing usageEventId' }, 400);
    }

    const nodeApiKey = Deno.env.get('NEXART_NODE_API_KEY');
    if (!nodeApiKey) {
      return jsonResp({ ok: false, error: 'CONFIG', message: 'Missing NEXART_NODE_API_KEY.' }, 500);
    }

    let nodeUrl = (Deno.env.get('NEXART_NODE_URL') || 'https://nexart-canonical-renderer-production.up.railway.app').trim();
    if (!nodeUrl.startsWith('http://') && !nodeUrl.startsWith('https://')) {
      nodeUrl = `https://${nodeUrl}`;
    }
    nodeUrl = nodeUrl.replace(/\/+$/, '');

    // ── Fetch the existing bundle owned by this user ──
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from('cer_bundles')
      .select('*')
      .eq('usage_event_id', usageEventId)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !row) {
      return jsonResp({ ok: false, error: 'NOT_FOUND', message: 'Bundle not found or not owned by user' }, 404);
    }

    const storedBundle = row.cer_bundle_redacted as Record<string, unknown>;
    const bundleType = (storedBundle.bundleType ?? row.bundle_type) as string;
    const isCodeMode = bundleType === 'cer.codemode.render.v1';
    const surface = isCodeMode ? 'codemode' : 'ai';

    // ── Normalize via transport wrapper (NO hashing) ──
    const normalizeResult = normalizeForAttestation(
      storedBundle,
      surface as 'codemode' | 'ai',
      row.certificate_hash as string | null,
      row.bundle_type as string | null,
    );

    if (!normalizeResult.ok) {
      console.error(`Normalization failed for event ${usageEventId}: ${normalizeResult.error} — ${normalizeResult.message}`);
      return jsonResp({
        ok: false,
        error: normalizeResult.error,
        message: normalizeResult.message,
      }, 422);
    }

    const { bundle: envelopedBundle, legacyWrapped, certificateHash } = normalizeResult;

    console.info(JSON.stringify({
      action: 'reattest_normalize',
      legacyWrapped,
      surface,
      certificateHash,
      usageEventId,
    }));

    // ── Determine endpoint ──
    const snap = (envelopedBundle.snapshot ?? {}) as Record<string, unknown>;
    const isRedacted = isCodeMode
      ? true // Code Mode stored bundles always go to /api/stamp
      : (snap.input == null || snap.output == null || snap.prompt == null);
    const endpoint = isRedacted ? '/api/stamp' : '/api/attest';

    // ── Build payload: remove existing attestation (node generates it) ──
    const payloadObj: Record<string, unknown> = JSON.parse(JSON.stringify(envelopedBundle));
    delete payloadObj.attestation;
    if (payloadObj.meta && typeof payloadObj.meta === 'object') {
      const meta = { ...(payloadObj.meta as Record<string, unknown>) };
      delete meta.attestation;
      payloadObj.meta = meta;
    }

    // For non-legacy-wrapped redacted AI bundles, we still set provenance
    // but we do NOT recompute hashes — we send the existing certificateHash
    if (isRedacted && !legacyWrapped) {
      const meta = (payloadObj.meta && typeof payloadObj.meta === 'object')
        ? { ...(payloadObj.meta as Record<string, unknown>) }
        : {};
      if (!meta.provenance) {
        meta.provenance = {
          originalCertificateHash: payloadObj.certificateHash ?? null,
          kind: 'redacted_export',
          redactedAt: new Date().toISOString(),
        };
      }
      payloadObj.meta = meta;
    }

    // ── Validate required top-level fields ──
    const requiredFields = ['version', 'createdAt', 'snapshot'] as const;
    const missingFields = requiredFields.filter(f => payloadObj[f] == null);
    if (missingFields.length > 0) {
      console.error(`Bundle ${usageEventId} missing required fields: ${missingFields.join(', ')}. Keys: ${JSON.stringify(Object.keys(payloadObj))}`);
      return jsonResp({
        ok: false,
        error: 'INVALID_BUNDLE',
        message: `Bundle missing required fields: ${missingFields.join(', ')}. Cannot send to node.`,
        missingFields,
        presentKeys: Object.keys(payloadObj),
      }, 422);
    }

    const payload = JSON.parse(JSON.stringify(payloadObj));
    const payloadJson = JSON.stringify(payload);
    const payloadByteSize = new TextEncoder().encode(payloadJson).byteLength;

    console.info(`Re-attesting bundle ${usageEventId} via ${nodeUrl}${endpoint} (isRedacted=${isRedacted}, legacyWrapped=${legacyWrapped})`);
    console.info(`bundleType=${payload.bundleType} certificateHash=${payload.certificateHash}`);
    console.info(`payloadByteSize=${payloadByteSize}`);

    // ── Call node ──
    const nodeResp = await fetch(`${nodeUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nodeApiKey}`,
      },
      body: payloadJson,
    });

    if (!nodeResp.ok) {
      let errBody = '';
      let errJson: Record<string, unknown> | null = null;
      try {
        errBody = await nodeResp.text();
        errJson = JSON.parse(errBody);
      } catch { /* keep raw */ }

      const upstreamMessage = (errJson?.message || errJson?.error || errBody || 'Unknown') as string;
      const requestId = (errJson?.requestId || nodeResp.headers.get('x-request-id') || null) as string | null;

      console.error(`Node ${endpoint} failed: HTTP ${nodeResp.status}`, errBody.slice(0, 2000));

      const clientStatus = nodeResp.status >= 400 && nodeResp.status < 500 ? nodeResp.status : 502;

      return jsonResp({
        ok: false,
        error: 'NODE_ERROR',
        message: `Node returned HTTP ${nodeResp.status}: ${upstreamMessage.slice(0, 300)}`,
        httpStatus: nodeResp.status,
        upstreamStatus: nodeResp.status,
        upstreamMessage: upstreamMessage.slice(0, 500),
        requestId,
      }, clientStatus);
    }

    const result = await nodeResp.json() as Record<string, unknown>;

    // ── Extract attestation fields ──
    console.info(`Node response keys: ${JSON.stringify(Object.keys(result))}`);
    const nested = (result.attestation ?? result.stamp ?? result.data ?? null) as Record<string, unknown> | null;
    if (nested && typeof nested === 'object') {
      console.info(`Nested object keys: ${JSON.stringify(Object.keys(nested))}`);
    }

    const src = { ...result, ...(nested ?? {}) };

    const signedAttestation: Record<string, unknown> = {
      mode: isRedacted ? 'stamp' : 'attest',
      attestationId: src.attestationId ?? (row.attestation_json as Record<string, unknown>)?.attestationId ?? null,
      hash: src.hash ?? src.certificateHash ?? row.certificate_hash,
      nodeRuntimeHash: src.nodeRuntimeHash ?? null,
      receipt: src.receipt ?? null,
      signatureB64Url: src.signatureB64Url ?? src.signature ?? null,
      attestorKeyId: src.attestorKeyId ?? src.kid ?? null,
      attestedAt: src.attestedAt ?? src.timestamp ?? new Date().toISOString(),
      nodeUrl,
      protocolVersion: src.protocolVersion ?? null,
      checks: src.checks ?? null,
    };

    // ── Persist: attestation_json + updated bundle with meta.attestation ──
    const updatedBundle = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
    const meta = (updatedBundle.meta && typeof updatedBundle.meta === 'object')
      ? { ...(updatedBundle.meta as Record<string, unknown>) }
      : {};

    meta.attestation = {
      mode: signedAttestation.mode,
      checks: signedAttestation.checks ?? null,
      receipt: signedAttestation.receipt ?? null,
      signatureB64Url: signedAttestation.signatureB64Url ?? null,
      attestorKeyId: signedAttestation.attestorKeyId ?? null,
      nodeUrl: signedAttestation.nodeUrl ?? null,
      attestedAt: signedAttestation.attestedAt ?? null,
      protocolVersion: signedAttestation.protocolVersion ?? null,
      nodeRuntimeHash: signedAttestation.nodeRuntimeHash ?? null,
      attestationId: signedAttestation.attestationId ?? null,
      hash: signedAttestation.hash ?? null,
    };
    updatedBundle.meta = meta;

    const updateFields: Record<string, unknown> = {
      attestation_json: signedAttestation,
      cer_bundle_redacted: updatedBundle,
    };

    const { error: updateErr } = await supabaseAdmin
      .from('cer_bundles')
      .update(updateFields)
      .eq('usage_event_id', usageEventId)
      .eq('user_id', user.id);

    if (updateErr) {
      console.error('Failed to update attestation:', updateErr);
      return jsonResp({ ok: false, error: 'DB_UPDATE', message: updateErr.message }, 500);
    }

    const hasSigned = !!(signedAttestation.receipt && signedAttestation.signatureB64Url && signedAttestation.attestorKeyId);
    console.info(`hasSigned=${hasSigned} receipt=${!!signedAttestation.receipt} sig=${!!signedAttestation.signatureB64Url} kid=${!!signedAttestation.attestorKeyId}`);

    return jsonResp({
      ok: true,
      attestation: signedAttestation,
      stamp: hasSigned ? 'signed' : 'legacy',
      endpoint,
      legacyWrapped,
      nodeResponseKeys: Object.keys(result),
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('re-attest error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message }, 500);
  }
});
