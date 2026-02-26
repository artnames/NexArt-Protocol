import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Fetch the existing bundle owned by this user
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from('cer_bundles')
      .select('*')
      .eq('usage_event_id', usageEventId)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !row) {
      return jsonResp({ ok: false, error: 'NOT_FOUND', message: 'Bundle not found or not owned by user' }, 404);
    }

    // The stored redacted bundle IS the full envelope the node expects.
    // It already has sensitive fields (input/output/prompt) removed by store-cer-bundle.
    // We send it as-is, only stripping any existing attestation to avoid recursion.
    const storedBundle = row.cer_bundle_redacted as Record<string, unknown>;

    // Build the payload: full bundle minus attestation fields (node generates those)
    const payloadObj: Record<string, unknown> = { ...storedBundle };
    // Remove attestation-related fields that the node produces (not inputs)
    delete payloadObj.attestation;
    if (payloadObj.meta && typeof payloadObj.meta === 'object') {
      const meta = { ...(payloadObj.meta as Record<string, unknown>) };
      delete meta.attestation;
      payloadObj.meta = meta;
    }

    // Ensure JSON-safe (strip any undefined remnants)
    const payload = JSON.parse(JSON.stringify(payloadObj));

    const payloadKeys = Object.keys(payload);
    const snapshotKeys = payload.snapshot ? Object.keys(payload.snapshot) : [];
    const payloadJson = JSON.stringify(payload);
    const payloadByteSize = new TextEncoder().encode(payloadJson).byteLength;

    console.info(`Re-attesting bundle ${usageEventId} via ${nodeUrl}/api/attest`);
    console.info(`bundleType=${payload.bundleType} certificateHash=${payload.certificateHash}`);
    console.info(`payloadKeys=[${payloadKeys.join(',')}] snapshotKeys=[${snapshotKeys.join(',')}]`);
    console.info(`payloadByteSize=${payloadByteSize}`);

    const attestResp = await fetch(`${nodeUrl}/api/attest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nodeApiKey}`,
      },
      body: payloadJson,
    });

    if (!attestResp.ok) {
      let errBody = '';
      let errJson: Record<string, unknown> | null = null;
      try {
        errBody = await attestResp.text();
        errJson = JSON.parse(errBody);
      } catch { /* keep raw */ }

      const upstreamMessage = (errJson?.message || errJson?.error || errBody || 'Unknown') as string;
      const requestId = (errJson?.requestId || attestResp.headers.get('x-request-id') || null) as string | null;

      console.error(`Node re-attest failed: HTTP ${attestResp.status}`, errBody.slice(0, 2000));
      console.error(`Sent payload keys: [${payloadKeys.join(',')}]`);
      console.error(`Sent snapshot keys: [${snapshotKeys.join(',')}]`);
      console.error(`Payload preview: ${payloadJson.slice(0, 1500)}`);

      return jsonResp({
        ok: false,
        error: 'NODE_ERROR',
        message: `Node returned HTTP ${attestResp.status}: ${upstreamMessage.slice(0, 300)}`,
        httpStatus: attestResp.status,
        upstreamStatus: attestResp.status,
        upstreamMessage: upstreamMessage.slice(0, 500),
        requestId,
      }, 502);
    }

    const attestResult = await attestResp.json() as Record<string, unknown>;

    // Normalize signed receipt
    const signedAttestation: Record<string, unknown> = {
      attestationId: attestResult.attestationId ?? (row.attestation_json as Record<string, unknown>)?.attestationId ?? null,
      hash: attestResult.hash ?? row.certificate_hash,
      nodeRuntimeHash: attestResult.nodeRuntimeHash ?? null,
      receipt: attestResult.receipt ?? null,
      signatureB64Url: attestResult.signatureB64Url ?? null,
      attestorKeyId: attestResult.attestorKeyId ?? attestResult.kid ?? null,
      attestedAt: attestResult.attestedAt ?? new Date().toISOString(),
      nodeUrl,
      protocolVersion: attestResult.protocolVersion ?? null,
    };

    // Persist signed receipt in attestation_json AND inside bundle.meta.attestation
    const updatedBundle = JSON.parse(JSON.stringify(storedBundle)) as Record<string, unknown>;
    const meta = (updatedBundle.meta && typeof updatedBundle.meta === 'object')
      ? { ...(updatedBundle.meta as Record<string, unknown>) }
      : {};

    meta.attestation = {
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

    const { error: updateErr } = await supabaseAdmin
      .from('cer_bundles')
      .update({
        attestation_json: signedAttestation,
        cer_bundle_redacted: updatedBundle,
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
      stamp: hasSigned ? 'signed' : 'legacy',
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('re-attest error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message }, 500);
  }
});
