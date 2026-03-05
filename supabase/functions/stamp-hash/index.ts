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

    // ── Fetch the existing bundle to get its certificateHash ──
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
    const certificateHash = (storedBundle.certificateHash ?? row.certificate_hash) as string | null;

    if (!certificateHash) {
      return jsonResp({
        ok: false,
        error: 'MISSING_CERTIFICATE_HASH',
        message: 'Cannot stamp: no certificateHash on record.',
      }, 400);
    }

    const bundleType = (storedBundle.bundleType ?? row.bundle_type ?? 'unknown') as string;
    const surface = bundleType === 'cer.codemode.render.v1' ? 'codemode' : 'ai';

    // ── Build hash-only stamp payload ──
    // This sends ONLY the certificateHash + metadata to the node's /api/stamp.
    // No snapshot, no content. The node signs the hash as an observation.
    const protocolVersion = (storedBundle.version ?? (storedBundle.snapshot as Record<string, unknown> | undefined)?.protocolVersion ?? null) as string | null;
    const stampPayload: Record<string, unknown> = {
      certificateHash,
      bundleType,
      surface,
      mode: 'hash-only',
    };
    if (protocolVersion) {
      stampPayload.protocolVersion = protocolVersion;
    }

    console.info(JSON.stringify({
      action: 'stamp_hash',
      certificateHash,
      bundleType,
      surface,
      usageEventId,
    }));

    const payloadJson = JSON.stringify(stampPayload);

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

      console.error(`Node /api/stamp hash-only failed: HTTP ${nodeResp.status}`, errBody.slice(0, 2000));

      // If the node doesn't support hash-only mode or this bundleType
      if (nodeResp.status === 400 || nodeResp.status === 422) {
        // Detect if error is bundleType-specific
        const isBundleTypeIssue = upstreamMessage.toLowerCase().includes('bundle') ||
          upstreamMessage.toLowerCase().includes('unsupported') ||
          upstreamMessage.toLowerCase().includes('type');

        return jsonResp({
          ok: false,
          error: isBundleTypeIssue ? 'NODE_HASH_ONLY_UNSUPPORTED_FOR_BUNDLETYPE' : 'NODE_HASH_ONLY_UNSUPPORTED',
          message: isBundleTypeIssue
            ? `Hash-only timestamp is not supported for bundleType "${bundleType}" by the node.`
            : 'Node does not yet support hash-only stamp mode.',
          bundleType,
          hint: 'Node hash-only stamp support is required. Contact the node operator.',
          upstreamStatus: nodeResp.status,
          upstreamMessage: upstreamMessage.slice(0, 500),
          requestId,
        }, 501);
      }

      return jsonResp({
        ok: false,
        error: 'NODE_ERROR',
        message: `Node returned HTTP ${nodeResp.status}: ${upstreamMessage.slice(0, 300)}`,
        upstreamStatus: nodeResp.status,
        requestId,
      }, 502);
    }

    const result = await nodeResp.json() as Record<string, unknown>;

    console.info(`Node stamp-hash response keys: ${JSON.stringify(Object.keys(result))}`);
    const nested = (result.attestation ?? result.stamp ?? result.data ?? null) as Record<string, unknown> | null;
    const src = { ...result, ...(nested ?? {}) };

    const signedAttestation: Record<string, unknown> = {
      mode: 'hash-only',
      attestationId: src.attestationId ?? null,
      hash: certificateHash,
      nodeRuntimeHash: src.nodeRuntimeHash ?? null,
      receipt: src.receipt ?? null,
      signatureB64Url: src.signatureB64Url ?? src.signature ?? null,
      attestorKeyId: src.attestorKeyId ?? src.kid ?? null,
      attestedAt: src.attestedAt ?? src.timestamp ?? new Date().toISOString(),
      nodeUrl,
      protocolVersion: src.protocolVersion ?? null,
      checks: src.checks ?? null,
    };

    // ── Persist attestation_json ──
    const { error: updateErr } = await supabaseAdmin
      .from('cer_bundles')
      .update({ attestation_json: signedAttestation })
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
      stamp: hasSigned ? 'signed_hash_only' : 'legacy',
      submittedCertificateHash: certificateHash,
      mode: 'hash-only',
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('stamp-hash error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message }, 500);
  }
});
