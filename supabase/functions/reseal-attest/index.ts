import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { computeCertificateHash } from "../_shared/cer-hash.ts";

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
    const originalCertificateHash = (storedBundle.certificateHash ?? row.certificate_hash) as string | null;

    if (!bundleType) {
      return jsonResp({ ok: false, error: 'MISSING_BUNDLE_TYPE', message: 'Cannot reseal: no bundleType on record.' }, 400);
    }

    // ── Detect redaction ──
    const snap = storedBundle.snapshot as Record<string, unknown> | undefined;
    const isCodeMode = bundleType === 'cer.codemode.render.v1';

    // For AI bundles, check if snapshot fields are missing (redacted during ingestion)
    const isRedacted = !isCodeMode && snap != null && (
      !('input' in snap) || snap.input == null ||
      !('output' in snap) || snap.output == null ||
      !('prompt' in snap) || snap.prompt == null
    );

    if (!isRedacted && !isCodeMode) {
      // Not redacted — user should use full re-attest instead
      return jsonResp({
        ok: false,
        error: 'NOT_REDACTED',
        message: 'This bundle does not appear to be redacted. Use full re-attest instead.',
      }, 400);
    }

    if (isCodeMode) {
      // Code Mode bundles don't get reseal — they use full re-attest or hash-only
      return jsonResp({
        ok: false,
        error: 'NOT_APPLICABLE',
        message: 'Reseal is for redacted AI bundles. Use full re-attest or hash-only timestamp for Code Mode records.',
      }, 400);
    }

    // ── Build NEW sealed bundle over the redacted snapshot ──
    const version = (storedBundle.version as string) ?? '0.1';
    const createdAt = (storedBundle.createdAt as string) ?? new Date().toISOString();

    const resealedBundle: Record<string, unknown> = {
      bundleType,
      version,
      createdAt,
      snapshot: JSON.parse(JSON.stringify(snap)),
    };

    // Compute NEW certificateHash over the redacted payload
    const newCertificateHash = await computeCertificateHash(resealedBundle);
    resealedBundle.certificateHash = newCertificateHash;

    // Add provenance metadata
    resealedBundle.meta = {
      provenance: {
        kind: 'redacted_reseal',
        originalCertificateHash: originalCertificateHash ?? null,
        redactedAt: new Date().toISOString(),
        redactionPolicy: 'Snapshot fields (input, output, prompt) removed during ingestion for privacy. New certificateHash computed over redacted payload.',
      },
    };

    console.info(JSON.stringify({
      action: 'reseal_redacted',
      originalCertificateHash,
      newCertificateHash,
      bundleType,
      usageEventId,
    }));

    // ── Strip attestation from payload before sending to node ──
    const payloadObj = JSON.parse(JSON.stringify(resealedBundle));
    delete payloadObj.attestation;

    const payloadJson = JSON.stringify(payloadObj);

    console.info(`Reseal+attest bundle ${usageEventId} via ${nodeUrl}/api/stamp`);
    console.info(`newCertificateHash=${newCertificateHash} originalCertificateHash=${originalCertificateHash}`);

    // ── Call node /api/stamp ──
    const nodeResp = await fetch(`${nodeUrl}/api/stamp`, {
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

      console.error(`Node /api/stamp failed for reseal: HTTP ${nodeResp.status}`, errBody.slice(0, 2000));

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
    const nested = (result.attestation ?? result.stamp ?? result.data ?? null) as Record<string, unknown> | null;
    const src = { ...result, ...(nested ?? {}) };

    const signedAttestation: Record<string, unknown> = {
      mode: 'redacted_reseal',
      attestationId: src.attestationId ?? null,
      hash: newCertificateHash,
      originalCertificateHash: originalCertificateHash ?? null,
      nodeRuntimeHash: src.nodeRuntimeHash ?? null,
      receipt: src.receipt ?? null,
      signatureB64Url: src.signatureB64Url ?? src.signature ?? null,
      attestorKeyId: src.attestorKeyId ?? src.kid ?? null,
      attestedAt: src.attestedAt ?? src.timestamp ?? new Date().toISOString(),
      nodeUrl,
      protocolVersion: src.protocolVersion ?? null,
      checks: src.checks ?? null,
    };

    // ── Persist attestation_json AND update certificate_hash to the new one ──
    const { error: updateErr } = await supabaseAdmin
      .from('cer_bundles')
      .update({
        attestation_json: signedAttestation,
        certificate_hash: newCertificateHash,
      })
      .eq('usage_event_id', usageEventId)
      .eq('user_id', user.id);

    if (updateErr) {
      console.error('Failed to update attestation:', updateErr);
      return jsonResp({ ok: false, error: 'DB_UPDATE', message: updateErr.message }, 500);
    }

    const hasSigned = !!(signedAttestation.receipt && signedAttestation.signatureB64Url && signedAttestation.attestorKeyId);

    return jsonResp({
      ok: true,
      attestation: signedAttestation,
      stamp: hasSigned ? 'signed_redacted_reseal' : 'legacy',
      newCertificateHash,
      originalCertificateHash,
      mode: 'redacted_reseal',
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('reseal-attest error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message }, 500);
  }
});
