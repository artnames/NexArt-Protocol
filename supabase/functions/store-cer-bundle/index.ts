import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── helpers ──────────────────────────────────────────────────────────

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

function jsonResp(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getDbConnection() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) throw new Error("CONFIG: DATABASE_URL missing");
  return postgres(databaseUrl, {
    ssl: false,
    connection: { application_name: 'nexart-store-cer-bundle' },
  });
}

// ── handler ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: shared ingest secret ──
    const ingestSecret = Deno.env.get('CER_INGEST_SECRET');
    if (!ingestSecret) {
      console.error('CER_INGEST_SECRET not configured');
      return jsonResp({ ok: false, error: 'CONFIG', message: 'Server misconfigured', upserted: false }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ') || authHeader.replace('Bearer ', '') !== ingestSecret) {
      return jsonResp({ ok: false, error: 'UNAUTHORIZED', message: 'Invalid or missing ingest secret', upserted: false }, 401);
    }

    // ── Parse body ──
    const body = await req.json();

    // ── Normalize usageEventId: accept both camelCase and snake_case ──
    const rawEventId = body.usageEventId ?? body.usage_event_id;
    if (rawEventId === undefined || rawEventId === null || String(rawEventId).trim() === '') {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: 'Missing usageEventId (or usage_event_id): must be a non-empty string or number',
        upserted: false, usageEventId: null, certificateHash: null,
      }, 400);
    }
    const usageEventId = String(rawEventId).trim();

    const eventIdNum = parseInt(usageEventId, 10);
    if (isNaN(eventIdNum)) {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: 'usageEventId must be numeric (or a numeric string)',
        upserted: false, usageEventId, certificateHash: null,
      }, 400);
    }

    const { bundle, attestation } = body;

    if (!bundle || typeof bundle !== 'object') {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: 'Missing or invalid bundle: must be an object',
        upserted: false, usageEventId, certificateHash: null,
      }, 400);
    }

    if (bundle.bundleType !== 'cer.ai.execution.v1') {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: `Missing or unsupported bundle.bundleType: got "${bundle.bundleType ?? '(undefined)'}", expected "cer.ai.execution.v1"`,
        upserted: false, usageEventId, certificateHash: null,
      }, 400);
    }

    const certificateHash = bundle.certificateHash ?? null;
    if (!certificateHash) {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: 'Missing bundle.certificateHash: required for storage',
        upserted: false, usageEventId, certificateHash: null,
      }, 400);
    }

    // ── Derive owner from Railway DB ──
    const sql = getDbConnection();
    let ownerId: string | null = null;
    try {
      const rows = await sql`
        SELECT ak.user_id
        FROM usage_events ue
        INNER JOIN api_keys ak ON ue.api_key_id = ak.id
        WHERE ue.id = ${eventIdNum}
        LIMIT 1
      `;
      if (rows.length > 0) {
        ownerId = rows[0].user_id;
      }
      await sql.end();
    } catch (dbErr) {
      try { await sql.end(); } catch { /* ignore */ }
      const e = dbErr as Error;
      console.error('Railway DB lookup failed:', e.message);
      return jsonResp({
        ok: false, error: 'DB_LOOKUP',
        message: `Failed to look up usage event owner: ${e.message}`,
        upserted: false, usageEventId, certificateHash,
      }, 500);
    }

    if (!ownerId) {
      return jsonResp({
        ok: false, error: 'NOT_FOUND',
        message: `No usage event found for id=${eventIdNum}, or event has no API key owner`,
        upserted: false, usageEventId, certificateHash,
      }, 400);
    }

    // ── Redact + sanitize ──
    const redacted = redactAndSanitize(bundle);

    // ── Upsert into cer_bundles ──
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: upsertError } = await supabaseAdmin
      .from('cer_bundles')
      .upsert(
        {
          usage_event_id: eventIdNum,
          user_id: ownerId,
          certificate_hash: certificateHash,
          bundle_type: bundle.bundleType,
          attestation_json: attestation ?? bundle.attestation ?? null,
          cer_bundle_redacted: redacted,
        },
        { onConflict: 'usage_event_id' },
      );

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return jsonResp({
        ok: false, error: 'DB_UPSERT', message: upsertError.message,
        upserted: false, usageEventId, certificateHash,
      }, 500);
    }

    return jsonResp({ ok: true, usageEventId, certificateHash, upserted: true }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('store-cer-bundle error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message, upserted: false }, 500);
  }
});
