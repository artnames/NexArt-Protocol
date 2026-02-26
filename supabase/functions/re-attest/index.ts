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

// --- Canonical JSON + SHA-256 (same rules as @nexart/ai-execution & Recânon) ---
function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Non-finite number: ${value}`);
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const entries = Object.keys(obj)
      .sort()
      .map((key) => {
        const val = obj[key];
        if (val === undefined) return null;
        return JSON.stringify(key) + ":" + canonicalize(val);
      })
      .filter((e) => e !== null);
    return "{" + entries.join(",") + "}";
  }
  throw new Error(`Unsupported type for canonical JSON: ${typeof value}`);
}

async function sha256Hex(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function computeCertificateHash(bundle: Record<string, unknown>): Promise<string> {
  const hashInput = {
    bundleType: bundle.bundleType,
    createdAt: bundle.createdAt,
    snapshot: bundle.snapshot,
    version: bundle.version,
  };
  const canonical = canonicalize(hashInput);
  return `sha256:${await sha256Hex(canonical)}`;
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

    const storedBundle = row.cer_bundle_redacted as Record<string, unknown>;

    // Determine if bundle is redacted
    const snap = (storedBundle?.snapshot ?? {}) as Record<string, unknown>;
    const isRedacted = snap.input == null || snap.output == null || snap.prompt == null;

    // Choose endpoint based on redaction status
    const endpoint = isRedacted ? '/api/stamp' : '/api/attest';

    // Build payload: full envelope minus existing attestation (node generates that)
    const payloadObj: Record<string, unknown> = JSON.parse(JSON.stringify(storedBundle));
    delete payloadObj.attestation;
    if (payloadObj.meta && typeof payloadObj.meta === 'object') {
      const meta = { ...(payloadObj.meta as Record<string, unknown>) };
      delete meta.attestation;
      payloadObj.meta = meta;
    }

    // For redacted bundles: recompute certificateHash over the redacted snapshot
    // and preserve the original hash in provenance
    if (isRedacted) {
      const originalCertificateHash = payloadObj.certificateHash as string | null;
      const redactedCertificateHash = await computeCertificateHash(payloadObj);
      payloadObj.certificateHash = redactedCertificateHash;

      // Set provenance metadata
      const meta = (payloadObj.meta && typeof payloadObj.meta === 'object')
        ? { ...(payloadObj.meta as Record<string, unknown>) }
        : {};
      meta.provenance = {
        originalCertificateHash: originalCertificateHash ?? null,
        kind: 'redacted_export',
        redactedAt: new Date().toISOString(),
      };
      payloadObj.meta = meta;

      console.info(`Redacted certificateHash recomputed: ${redactedCertificateHash} (original: ${originalCertificateHash})`);
    }

    // Ensure JSON-safe
    const payload = JSON.parse(JSON.stringify(payloadObj));
    const payloadJson = JSON.stringify(payload);
    const payloadByteSize = new TextEncoder().encode(payloadJson).byteLength;

    console.info(`Re-attesting bundle ${usageEventId} via ${nodeUrl}${endpoint} (isRedacted=${isRedacted})`);
    console.info(`bundleType=${payload.bundleType} certificateHash=${payload.certificateHash}`);
    console.info(`payloadByteSize=${payloadByteSize}`);

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

      // Propagate upstream status faithfully (400 → 400, not 502)
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

    // Normalize signed receipt — include all fields the node may return
    const signedAttestation: Record<string, unknown> = {
      mode: isRedacted ? 'stamp' : 'attest',
      attestationId: result.attestationId ?? (row.attestation_json as Record<string, unknown>)?.attestationId ?? null,
      hash: result.hash ?? row.certificate_hash,
      nodeRuntimeHash: result.nodeRuntimeHash ?? null,
      receipt: result.receipt ?? null,
      signatureB64Url: result.signatureB64Url ?? null,
      attestorKeyId: result.attestorKeyId ?? result.kid ?? null,
      attestedAt: result.attestedAt ?? new Date().toISOString(),
      nodeUrl,
      protocolVersion: result.protocolVersion ?? null,
      checks: result.checks ?? null,
    };

    // Persist signed receipt in attestation_json AND inside bundle.meta.attestation
    // Start from the payload we sent (which has recomputed hash + provenance for redacted)
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
      endpoint,
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('re-attest error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message }, 500);
  }
});
