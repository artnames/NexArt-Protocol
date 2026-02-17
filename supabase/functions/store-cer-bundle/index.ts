const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * store-cer-bundle: Persists a redacted CER bundle for a successful /api/attest run.
 *
 * Auth: Authorization: Bearer <CER_INGEST_SECRET> (shared secret, NOT JWT/service-role).
 *
 * Body:
 *   { usageEventId: string, bundle: object, attestation?: object }
 *
 * Redaction: snapshot.input, snapshot.output, snapshot.prompt are stripped before storage.
 *
 * curl example:
 *   curl -X POST https://<project>.supabase.co/functions/v1/store-cer-bundle \
 *     -H "Authorization: Bearer YOUR_CER_INGEST_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "usageEventId": "evt_abc123",
 *       "bundle": {
 *         "bundleType": "cer.ai.execution.v1",
 *         "certificateHash": "sha256-...",
 *         "snapshot": { "input": "REDACTED_BY_FN", "inputHash": "sha256-..." },
 *         "attestation": { "nodeId": "n1", "signature": "sig..." }
 *       }
 *     }'
 */

// ── helpers ──────────────────────────────────────────────────────────

/** Deep-remove keys whose value is `undefined`; convert undefined array items to null. */
function deepSanitize(val: unknown): unknown {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map((v) => deepSanitize(v === undefined ? null : v));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (v !== undefined) out[k] = deepSanitize(v);
  }
  return out;
}

/** Strip sensitive snapshot fields, then deep-sanitize. */
function redactAndSanitize(bundle: Record<string, unknown>): Record<string, unknown> {
  const copy = JSON.parse(JSON.stringify(bundle));
  if (copy.snapshot && typeof copy.snapshot === 'object') {
    const snap = copy.snapshot as Record<string, unknown>;
    delete snap.input;
    delete snap.output;
    delete snap.prompt;
  }
  return deepSanitize(copy) as Record<string, unknown>;
}

function jsonError(error: string, message: string, status: number) {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ── handler ──────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: shared secret ──
    const ingestSecret = Deno.env.get('CER_INGEST_SECRET');
    if (!ingestSecret) {
      console.error('CER_INGEST_SECRET not configured');
      return jsonError('CONFIG', 'Server misconfigured', 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ') || authHeader.replace('Bearer ', '') !== ingestSecret) {
      return jsonError('UNAUTHORIZED', 'Invalid or missing ingest secret', 401);
    }

    // ── Parse + validate body ──
    const body = await req.json();
    const { usageEventId, bundle, attestation } = body;

    if (!usageEventId || typeof usageEventId !== 'string' || usageEventId.trim() === '') {
      return jsonError('VALIDATION', 'usageEventId must be a non-empty string', 400);
    }

    if (!bundle || typeof bundle !== 'object') {
      return jsonError('VALIDATION', 'bundle must be an object', 400);
    }

    if (bundle.bundleType !== 'cer.ai.execution.v1') {
      return jsonError('VALIDATION', `Unsupported bundleType: ${bundle.bundleType}`, 400);
    }

    // ── Redact + sanitize ──
    const redacted = redactAndSanitize(bundle);

    // ── Upsert into cer_bundles ──
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // usageEventId comes as string from the node; cast to integer for the DB column
    const eventIdNum = parseInt(usageEventId, 10);
    if (isNaN(eventIdNum)) {
      return jsonError('VALIDATION', 'usageEventId must be numeric', 400);
    }

    const certificateHash = bundle.certificateHash || null;

    const { error: upsertError } = await supabaseAdmin
      .from('cer_bundles')
      .upsert(
        {
          usage_event_id: eventIdNum,
          user_id: bundle.userId || body.userId || '00000000-0000-0000-0000-000000000000',
          certificate_hash: certificateHash,
          bundle_type: bundle.bundleType,
          attestation_json: attestation ?? bundle.attestation ?? null,
          cer_bundle_redacted: redacted,
        },
        { onConflict: 'usage_event_id' },
      );

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return jsonError('DB_UPSERT', upsertError.message, 500);
    }

    return new Response(
      JSON.stringify({ ok: true, usageEventId, certificateHash }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const e = err as Error;
    console.error('store-cer-bundle error:', e.message);
    return jsonError('INTERNAL', e.message, 500);
  }
});
