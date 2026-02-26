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
    // Auth: require user JWT
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

    // Check required env vars
    const nodeApiKey = Deno.env.get('NEXART_NODE_API_KEY');
    if (!nodeApiKey) {
      console.error('Missing NEXART_NODE_API_KEY environment variable');
      return jsonResp({ ok: false, error: 'CONFIG', message: 'Missing NEXART_NODE_API_KEY. Please configure this secret.' }, 500);
    }

    let nodeUrl = (Deno.env.get('NEXART_NODE_URL') || 'https://nexart-canonical-renderer-production.up.railway.app').trim();
    // Ensure protocol prefix exists
    if (!nodeUrl.startsWith('http://') && !nodeUrl.startsWith('https://')) {
      nodeUrl = `https://${nodeUrl}`;
    }
    // Remove trailing slash
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

    // Build the full CER bundle payload to send to the node
    const redactedBundle = row.cer_bundle_redacted as Record<string, unknown>;
    const certificateHash = row.certificate_hash;

    // Construct the full bundle as it would appear for verification
    const fullPayload: Record<string, unknown> = {
      ...redactedBundle,
      certificateHash,
      bundleType: row.bundle_type,
    };

    // Call the node's /api/attest endpoint with auth
    console.info(`Re-attesting bundle ${usageEventId} via ${nodeUrl}/api/attest`);
    const attestResp = await fetch(`${nodeUrl}/api/attest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nodeApiKey}`,
      },
      body: JSON.stringify(fullPayload),
    });

    if (!attestResp.ok) {
      let errBody = '';
      let errJson: Record<string, unknown> | null = null;
      try {
        errBody = await attestResp.text();
        errJson = JSON.parse(errBody);
      } catch {
        // errBody is already set as text
      }
      const errMessage = (errJson?.message || errJson?.error || errBody || 'Unknown node error') as string;
      const requestId = (errJson?.requestId || attestResp.headers.get('x-request-id') || null) as string | null;
      
      console.error(`Node re-attest failed: HTTP ${attestResp.status}`, errBody.slice(0, 500));
      return jsonResp({
        ok: false,
        error: 'NODE_ERROR',
        message: `Node returned HTTP ${attestResp.status}: ${errMessage.slice(0, 300)}`,
        httpStatus: attestResp.status,
        requestId,
      }, 502);
    }

    const attestResult = await attestResp.json() as Record<string, unknown>;

    // Extract the signed receipt fields
    const signedAttestation: Record<string, unknown> = {
      attestationId: attestResult.attestationId ?? (row.attestation_json as Record<string, unknown>)?.attestationId ?? null,
      hash: attestResult.hash ?? certificateHash,
      nodeRuntimeHash: attestResult.nodeRuntimeHash ?? null,
      receipt: attestResult.receipt ?? null,
      signatureB64Url: attestResult.signatureB64Url ?? null,
      attestorKeyId: attestResult.attestorKeyId ?? attestResult.kid ?? null,
      attestedAt: attestResult.attestedAt ?? new Date().toISOString(),
      nodeUrl,
      protocolVersion: attestResult.protocolVersion ?? null,
    };

    // Update the attestation_json in the database
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
      stamp: hasSigned ? 'signed' : 'legacy',
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('re-attest error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message }, 500);
  }
});
