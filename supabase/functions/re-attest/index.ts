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

function findFirstUndefinedPath(value: unknown, basePath = 'payload'): string | null {
  if (value === undefined) return basePath;
  if (value === null || typeof value !== 'object') return null;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const found = findFirstUndefinedPath(value[i], `${basePath}[${i}]`);
      if (found) return found;
    }
    return null;
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const found = findFirstUndefinedPath(child, `${basePath}.${key}`);
    if (found) return found;
  }

  return null;
}

function localDeepSanitize(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (const item of value) {
      const sanitized = localDeepSanitize(item);
      if (sanitized !== undefined) out.push(sanitized);
    }
    return out;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const sanitized = localDeepSanitize(v);
    if (sanitized !== undefined) out[k] = sanitized;
  }
  return out;
}

let sdkSanitizer: ((value: unknown) => unknown) | null | undefined = undefined;

async function sanitizeForAttestationCompat(value: unknown): Promise<unknown> {
  if (sdkSanitizer === undefined) {
    try {
      const mod = await import("npm:@nexart/ai-execution");
      sdkSanitizer = typeof mod.sanitizeForAttestation === 'function'
        ? (mod.sanitizeForAttestation as (input: unknown) => unknown)
        : null;
    } catch {
      sdkSanitizer = null;
    }
  }

  if (sdkSanitizer) {
    try {
      return sdkSanitizer(value);
    } catch (err) {
      console.warn('sanitizeForAttestation failed; using local fallback', (err as Error).message);
    }
  }

  return localDeepSanitize(value);
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

    const redactedBundle = row.cer_bundle_redacted as Record<string, unknown>;
    const snapshot = redactedBundle.snapshot as Record<string, unknown> | undefined;
    const certificateHash = row.certificate_hash;

    // Only send attestable core fields to node
    const corePayload = {
      bundleType: row.bundle_type ?? redactedBundle.bundleType ?? null,
      version: (redactedBundle.version as string) ?? '0.1',
      createdAt: redactedBundle.createdAt ?? null,
      snapshot: snapshot ?? null,
      certificateHash: certificateHash ?? null,
    };

    const firstUndefinedPath = findFirstUndefinedPath(corePayload);
    const sdkSanitized = await sanitizeForAttestationCompat(corePayload);
    const payload = JSON.parse(JSON.stringify(sdkSanitized));
    const postSanitizeUndefinedPath = findFirstUndefinedPath(payload);

    if (postSanitizeUndefinedPath) {
      return jsonResp({
        ok: false,
        error: 'BAD_PAYLOAD',
        message: 'Payload still contains undefined after sanitization',
        firstUndefinedPath: postSanitizeUndefinedPath,
      }, 400);
    }

    const payloadJson = JSON.stringify(payload);
    const payloadByteSize = new TextEncoder().encode(payloadJson).byteLength;

    console.info(`Re-attesting bundle ${usageEventId} via ${nodeUrl}/api/attest`);
    console.info(`bundleType=${String(corePayload.bundleType)} certificateHash=${String(corePayload.certificateHash)}`);
    console.info(`payloadByteSize=${payloadByteSize} firstUndefinedPath=${firstUndefinedPath ?? 'null'}`);

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
      } catch {
        // keep raw text body
      }

      const upstreamMessage = (errJson?.message || errJson?.error || errBody || 'Unknown node error') as string;
      const requestId = (errJson?.requestId || attestResp.headers.get('x-request-id') || null) as string | null;

      console.error(`Node re-attest failed: HTTP ${attestResp.status}`, upstreamMessage.slice(0, 500));
      return jsonResp({
        ok: false,
        error: 'NODE_ERROR',
        message: `Node returned HTTP ${attestResp.status}: ${upstreamMessage.slice(0, 300)}`,
        httpStatus: attestResp.status,
        upstreamStatus: attestResp.status,
        upstreamMessage: upstreamMessage.slice(0, 500),
        firstUndefinedPath,
        requestId,
      }, 502);
    }

    const attestResult = await attestResp.json() as Record<string, unknown>;

    // Normalize signed receipt payload
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

    // Persist signed receipt both in attestation_json and bundle.meta.attestation
    const updatedBundle = JSON.parse(JSON.stringify(redactedBundle)) as Record<string, unknown>;
    const meta = (updatedBundle.meta && typeof updatedBundle.meta === 'object')
      ? (updatedBundle.meta as Record<string, unknown>)
      : {};

    meta.attestation = {
      ...(meta.attestation as Record<string, unknown> | undefined ?? {}),
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
