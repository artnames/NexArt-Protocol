import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResp(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Re-attest a CER bundle to obtain a signed receipt from the NexArt canonical node.
 * 
 * This function:
 * 1. Validates user owns the bundle
 * 2. Sends the redacted bundle to the node's /attest endpoint
 * 3. Stores the returned signed receipt in attestation_json
 * 4. Returns the updated attestation for the UI
 * 
 * Body: { usageEventId: number, nodeUrl?: string }
 */
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

    // Build the payload to send to the node for re-attestation
    const redactedBundle = row.cer_bundle_redacted as Record<string, unknown>;
    const certificateHash = row.certificate_hash;

    // The node URL defaults to the NexArt canonical node
    const nodeUrl = (body.nodeUrl as string) || 'https://node.nexart.io';

    // Call the node's /api/re-attest endpoint
    const attestResp = await fetch(`${nodeUrl}/api/re-attest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bundle: redactedBundle,
        certificateHash,
        bundleType: row.bundle_type,
      }),
    });

    if (!attestResp.ok) {
      const errBody = await attestResp.text();
      console.error('Node re-attest failed:', attestResp.status, errBody);
      return jsonResp({
        ok: false, error: 'NODE_ERROR',
        message: `Node returned ${attestResp.status}: ${errBody.slice(0, 200)}`,
      }, 502);
    }

    const attestResult = await attestResp.json() as Record<string, unknown>;

    // Extract the signed receipt fields
    const signedAttestation = {
      attestationId: attestResult.attestationId ?? (row.attestation_json as Record<string, unknown>)?.attestationId ?? null,
      hash: attestResult.hash ?? certificateHash,
      nodeRuntimeHash: attestResult.nodeRuntimeHash ?? (row.attestation_json as Record<string, unknown>)?.nodeRuntimeHash ?? null,
      receipt: attestResult.receipt ?? null,
      signatureB64Url: attestResult.signatureB64Url ?? null,
      attestorKeyId: attestResult.attestorKeyId ?? attestResult.kid ?? null,
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

    return jsonResp({
      ok: true,
      attestation: signedAttestation,
      stamp: signedAttestation.receipt ? 'signed' : 'legacy',
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('re-attest error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message }, 500);
  }
});
