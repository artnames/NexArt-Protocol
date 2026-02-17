import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── helpers ──────────────────────────────────────────────────────────

const SUPPORTED_BUNDLE_TYPES = ['cer.ai.execution.v1', 'cer.codemode.render.v1'] as const;

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

function redactAndSanitize(bundle: Record<string, unknown>, bundleType: string): Record<string, unknown> {
  const copy = JSON.parse(JSON.stringify(bundle));
  if (bundleType === 'cer.ai.execution.v1') {
    // Redact AI-specific sensitive fields
    if (copy.snapshot && typeof copy.snapshot === 'object') {
      const snap = copy.snapshot as Record<string, unknown>;
      delete snap.input;
      delete snap.output;
      delete snap.prompt;
    }
  }
  // For render bundles, no redaction needed (no sensitive payloads)
  return deepSanitize(copy) as Record<string, unknown>;
}

/** Stable canonical JSON for hashing (sorted keys, no whitespace) */
function canonicalJson(obj: unknown): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJson).join(',') + ']';
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const entries = keys
    .filter(k => (obj as Record<string, unknown>)[k] !== undefined)
    .map(k => JSON.stringify(k) + ':' + canonicalJson((obj as Record<string, unknown>)[k]));
  return '{' + entries.join(',') + '}';
}

/** Compute sha256 hex hash */
async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Compute certificate hash for render bundles that don't have one */
async function computeCertificateHash(bundle: Record<string, unknown>): Promise<string> {
  // Remove meta fields that shouldn't be part of the hash
  const { createdAt, certificateHash, ...hashable } = bundle;
  const canonical = canonicalJson(hashable);
  const hex = await sha256Hex(canonical);
  return `sha256:${hex}`;
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

    // ── Normalize usageEventId ──
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

    const { bundle, attestation, artifactBase64, artifactMime } = body;

    if (!bundle || typeof bundle !== 'object') {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: 'Missing or invalid bundle: must be an object',
        upserted: false, usageEventId, certificateHash: null,
      }, 400);
    }

    const bundleType = bundle.bundleType as string;
    if (!bundleType || !SUPPORTED_BUNDLE_TYPES.includes(bundleType as typeof SUPPORTED_BUNDLE_TYPES[number])) {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: `Unsupported bundle.bundleType: got "${bundleType ?? '(undefined)'}", expected one of: ${SUPPORTED_BUNDLE_TYPES.join(', ')}`,
        upserted: false, usageEventId, certificateHash: null,
      }, 400);
    }

    // ── Certificate hash: use provided or compute for render bundles ──
    let certificateHash = bundle.certificateHash as string | null ?? null;
    if (!certificateHash && bundleType === 'cer.codemode.render.v1') {
      certificateHash = await computeCertificateHash(bundle);
    }
    if (!certificateHash) {
      return jsonResp({
        ok: false, error: 'VALIDATION',
        message: 'Missing bundle.certificateHash and could not compute one',
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

    // ── Supabase admin client ──
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Upload PNG artifact if provided ──
    let artifactPath: string | null = null;
    if (artifactBase64 && artifactMime) {
      const artifactBytes = Uint8Array.from(atob(artifactBase64), c => c.charCodeAt(0));
      const ext = artifactMime === 'image/png' ? 'png' : 'bin';
      artifactPath = `user/${ownerId}/usage/${eventIdNum}/output.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('certified-artifacts')
        .upload(artifactPath, artifactBytes, {
          contentType: artifactMime,
          upsert: true,
        });

      if (uploadError) {
        console.error('Artifact upload error:', uploadError);
        return jsonResp({
          ok: false, error: 'ARTIFACT_UPLOAD',
          message: `Failed to upload artifact: ${uploadError.message}`,
          upserted: false, usageEventId, certificateHash,
        }, 500);
      }
    }

    // ── Redact + sanitize ──
    const redacted = redactAndSanitize(bundle, bundleType);

    // ── Upsert into cer_bundles ──
    const { error: upsertError } = await supabaseAdmin
      .from('cer_bundles')
      .upsert(
        {
          usage_event_id: eventIdNum,
          user_id: ownerId,
          certificate_hash: certificateHash,
          bundle_type: bundleType,
          attestation_json: attestation ?? bundle.attestation ?? null,
          cer_bundle_redacted: redacted,
          artifact_path: artifactPath,
          artifact_mime: artifactMime ?? null,
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

    return jsonResp({
      ok: true, usageEventId, bundleType, certificateHash,
      upserted: true, artifactPath: artifactPath ?? null,
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('store-cer-bundle error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message, upserted: false }, 500);
  }
});
