import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";
import { computeCertificateHash } from "../_shared/cer-hash.ts";
import { classifyCERBundle, hasSignedReceipt } from "../_shared/cer-classifier.ts";

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
    if (copy.snapshot && typeof copy.snapshot === 'object') {
      const snap = copy.snapshot as Record<string, unknown>;
      delete snap.input;
      delete snap.output;
      delete snap.prompt;
    }
  }
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
async function computeCertificateHashLocal(bundle: Record<string, unknown>): Promise<string> {
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

// ── Local verify helper ──────────────────────────────────────────────

async function localVerifyCertificateHash(bundle: Record<string, unknown>): Promise<boolean> {
  const recordedHash = bundle.certificateHash as string | undefined;
  if (!recordedHash || !recordedHash.startsWith('sha256:')) return false;
  if (!bundle.snapshot || typeof bundle.snapshot !== 'object') return false;
  try {
    const computedHash = await computeCertificateHash({
      bundleType: bundle.bundleType,
      version: bundle.version,
      createdAt: bundle.createdAt,
      snapshot: bundle.snapshot,
    });
    return computedHash === recordedHash;
  } catch {
    return false;
  }
}

// ── Auto-stamp rate limiter ──────────────────────────────────────────

const AUTO_STAMP_RATE_WINDOW_MS = 60_000; // 1 minute
const AUTO_STAMP_RATE_MAX = 10; // max auto-stamps per API-key-owner per window

// In-memory sliding window: Map<userId, timestamp[]>
const autoStampRateMap = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const cutoff = now - AUTO_STAMP_RATE_WINDOW_MS;
  let timestamps = autoStampRateMap.get(userId);
  if (!timestamps) {
    timestamps = [];
    autoStampRateMap.set(userId, timestamps);
  }
  // Prune old entries
  const filtered = timestamps.filter(t => t > cutoff);
  autoStampRateMap.set(userId, filtered);
  if (filtered.length >= AUTO_STAMP_RATE_MAX) {
    return true;
  }
  filtered.push(now);
  return false;
}

// ── Auto-stamp feature flags ─────────────────────────────────────────

const AUTO_STAMP_TIMEOUT_MS = 3000;

function isAutoStampEnabled(surface: 'ai' | 'codemode'): boolean {
  // Master kill switch (default: disabled)
  const master = Deno.env.get('AUTO_STAMP_ENABLED');
  if (!master || master.toLowerCase() !== 'true') return false;
  // Per-surface overrides (default: follow master)
  if (surface === 'ai') {
    const aiFlag = Deno.env.get('AUTO_STAMP_AI_ENABLED');
    if (aiFlag && aiFlag.toLowerCase() === 'false') return false;
  }
  if (surface === 'codemode') {
    const cmFlag = Deno.env.get('AUTO_STAMP_CODEMODE_ENABLED');
    if (cmFlag && cmFlag.toLowerCase() === 'false') return false;
  }
  return true;
}

// ── Auto-stamp types ─────────────────────────────────────────────────

type AutoStampStatus =
  | 'already_signed'
  | 'signed_full'
  | 'signed_redacted_reseal'
  | 'skipped_legacy_code'
  | 'skipped_unverifiable_ai'
  | 'skipped_unknown'
  | 'skipped_disabled'
  | 'skipped_user_disabled'
  | 'skipped_rate_limited'
  | 'failed';

interface AutoStampResult {
  autoStampStatus: AutoStampStatus;
  autoStampError: string | null;
  autoStampedAt: string | null;
  attestation: Record<string, unknown> | null;
  newCertificateHash: string | null;
}

// ── Auto-stamp logic ─────────────────────────────────────────────────

async function autoStamp(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventIdNum: number,
  ownerId: string,
  redactedBundle: Record<string, unknown>,
  originalBundle: Record<string, unknown>,
  bundleType: string,
  certificateHash: string,
  existingAttestation: Record<string, unknown> | null,
  projectId: string | null,
): Promise<AutoStampResult> {
  const now = new Date().toISOString();

  // 1) Already signed? Skip.
  if (hasSignedReceipt(existingAttestation)) {
    return { autoStampStatus: 'already_signed', autoStampError: null, autoStampedAt: null, attestation: null, newCertificateHash: null };
  }

  // 1b) Rate limit guard
  if (isRateLimited(ownerId)) {
    console.warn(`Auto-stamp rate limited for user ${ownerId}`);
    return { autoStampStatus: 'skipped_rate_limited', autoStampError: `Rate limited: max ${AUTO_STAMP_RATE_MAX} auto-stamps per minute`, autoStampedAt: now, attestation: null, newCertificateHash: null };
  }

  // Classify first to determine surface before checking flag
  const classification = classifyCERBundle(redactedBundle, bundleType, certificateHash, null);

  // 2) Check global feature flag
  if (!isAutoStampEnabled(classification.surface)) {
    return { autoStampStatus: 'skipped_disabled', autoStampError: null, autoStampedAt: now, attestation: null, newCertificateHash: null };
  }

  // 2b) Check project-level auto-stamp setting (if record has a project)
  if (projectId) {
    try {
      const { data: proj } = await supabaseAdmin
        .from('projects')
        .select('auto_stamp_enabled')
        .eq('id', projectId)
        .single();
      if (proj && (proj as any).auto_stamp_enabled === false) {
        return { autoStampStatus: 'skipped_user_disabled', autoStampError: 'Project auto-stamp disabled by user', autoStampedAt: now, attestation: null, newCertificateHash: null };
      }
    } catch {
      // If lookup fails, fall through to global behavior
    }
  }

  const nodeApiKey = Deno.env.get('NEXART_NODE_API_KEY');
  if (!nodeApiKey) {
    return { autoStampStatus: 'failed', autoStampError: 'NEXART_NODE_API_KEY not configured', autoStampedAt: now, attestation: null, newCertificateHash: null };
  }

  let nodeUrl = (Deno.env.get('NEXART_NODE_URL') || 'https://nexart-canonical-renderer-production.up.railway.app').trim();
  if (!nodeUrl.startsWith('http://') && !nodeUrl.startsWith('https://')) nodeUrl = `https://${nodeUrl}`;
  nodeUrl = nodeUrl.replace(/\/+$/, '');

  // Decision tree uses classification from above

  // 2) AI Execution
  if (classification.surface === 'ai') {
    if (classification.category === 'FULL_CER_VERIFIABLE' || classification.category === 'FULL_CER_MISMATCH') {
      // For AI, the stored bundle is always redacted during ingestion.
      // So even "FULL_CER_VERIFIABLE" on the REDACTED copy won't pass local verify
      // against the ORIGINAL hash. We need to check the original bundle.
      const origVerifyOk = await localVerifyCertificateHash(originalBundle);
      if (origVerifyOk) {
        return await callNodeAttest(supabaseAdmin, eventIdNum, ownerId, originalBundle, certificateHash, nodeUrl, nodeApiKey, 'full', now);
      }
      // Falls through to redacted reseal
    }

    if (classification.category === 'REDACTED_DERIVATIVE' || classification.category === 'FULL_CER_MISMATCH') {
      // Reseal the redacted snapshot with a NEW certificateHash
      return await resealAndAttest(supabaseAdmin, eventIdNum, ownerId, redactedBundle, bundleType, certificateHash, nodeUrl, nodeApiKey, now);
    }

    if (classification.category === 'LEGACY_INCOMPLETE_RECORD') {
      return { autoStampStatus: 'skipped_unverifiable_ai', autoStampError: classification.reason, autoStampedAt: now, attestation: null, newCertificateHash: null };
    }

    return { autoStampStatus: 'skipped_unknown', autoStampError: classification.reason, autoStampedAt: now, attestation: null, newCertificateHash: null };
  }

  // 3) Code Mode
  if (classification.surface === 'codemode') {
    if (classification.category === 'LEGACY_INCOMPLETE_RECORD') {
      return { autoStampStatus: 'skipped_legacy_code', autoStampError: classification.reason, autoStampedAt: now, attestation: null, newCertificateHash: null };
    }

    if (classification.category === 'FULL_CER_VERIFIABLE') {
      const localOk = await localVerifyCertificateHash(redactedBundle);
      if (localOk) {
        return await callNodeAttest(supabaseAdmin, eventIdNum, ownerId, redactedBundle, certificateHash, nodeUrl, nodeApiKey, 'full', now);
      }
      return { autoStampStatus: 'failed', autoStampError: 'Local verify failed on Code Mode bundle', autoStampedAt: now, attestation: null, newCertificateHash: null };
    }

    return { autoStampStatus: 'skipped_unknown', autoStampError: classification.reason, autoStampedAt: now, attestation: null, newCertificateHash: null };
  }

  return { autoStampStatus: 'skipped_unknown', autoStampError: 'Unrecognized surface', autoStampedAt: now, attestation: null, newCertificateHash: null };
}

async function callNodeAttest(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventIdNum: number,
  ownerId: string,
  bundle: Record<string, unknown>,
  certificateHash: string,
  nodeUrl: string,
  nodeApiKey: string,
  mode: 'full' | 'redacted_reseal',
  now: string,
): Promise<AutoStampResult> {
  try {
    // Strip existing attestation from payload
    const payloadObj = JSON.parse(JSON.stringify(bundle));
    delete payloadObj.attestation;
    if (payloadObj.meta && typeof payloadObj.meta === 'object') {
      const meta = { ...payloadObj.meta };
      delete meta.attestation;
      payloadObj.meta = meta;
    }

    // Use AbortController for strict timeout — never retry inside ingest
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTO_STAMP_TIMEOUT_MS);

    const nodeResp = await fetch(`${nodeUrl}/api/stamp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nodeApiKey}`,
      },
      body: JSON.stringify(payloadObj),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!nodeResp.ok) {
      const errText = await nodeResp.text();
      console.error(`Auto-stamp node error (${mode}): HTTP ${nodeResp.status}`, errText.slice(0, 500));
      return { autoStampStatus: 'failed', autoStampError: `Node HTTP ${nodeResp.status}`, autoStampedAt: now, attestation: null, newCertificateHash: null };
    }

    const result = await nodeResp.json() as Record<string, unknown>;
    const nested = (result.attestation ?? result.stamp ?? result.data ?? null) as Record<string, unknown> | null;
    const src = { ...result, ...(nested ?? {}) };

    const signedAttestation: Record<string, unknown> = {
      mode,
      autoStamped: true,
      attestationId: src.attestationId ?? null,
      hash: payloadObj.certificateHash ?? certificateHash,
      nodeRuntimeHash: src.nodeRuntimeHash ?? null,
      receipt: src.receipt ?? null,
      signatureB64Url: src.signatureB64Url ?? src.signature ?? null,
      attestorKeyId: src.attestorKeyId ?? src.kid ?? null,
      attestedAt: src.attestedAt ?? src.timestamp ?? now,
      nodeUrl,
      protocolVersion: src.protocolVersion ?? null,
    };

    const hasSigned = !!(signedAttestation.receipt && signedAttestation.signatureB64Url);
    const stampStatus: AutoStampStatus = hasSigned
      ? (mode === 'redacted_reseal' ? 'signed_redacted_reseal' : 'signed_full')
      : 'failed';

    // Persist attestation
    const { error: updateErr } = await supabaseAdmin
      .from('cer_bundles')
      .update({ attestation_json: signedAttestation })
      .eq('usage_event_id', eventIdNum)
      .eq('user_id', ownerId);

    if (updateErr) {
      console.error('Auto-stamp: failed to persist attestation', updateErr.message);
      return { autoStampStatus: 'failed', autoStampError: 'DB update failed after node call', autoStampedAt: now, attestation: signedAttestation, newCertificateHash: null };
    }

    return { autoStampStatus: stampStatus, autoStampError: null, autoStampedAt: now, attestation: signedAttestation, newCertificateHash: null };
  } catch (err) {
    const e = err as Error;
    const isTimeout = e.name === 'AbortError' || e.message?.includes('aborted');
    const reason = isTimeout ? 'timeout' : 'node_error';
    console.error(`Auto-stamp ${reason}:`, e.message);

    // Persist failure attestation so UI can show it
    const failAttestation: Record<string, unknown> = {
      autoStamped: true,
      status: 'failed',
      reason,
      error: e.message.slice(0, 200),
      failedAt: now,
    };
    try {
      await supabaseAdmin
        .from('cer_bundles')
        .update({ attestation_json: failAttestation })
        .eq('usage_event_id', eventIdNum)
        .eq('user_id', ownerId);
    } catch { /* best-effort */ }

    return { autoStampStatus: 'failed', autoStampError: `${reason}: ${e.message.slice(0, 150)}`, autoStampedAt: now, attestation: failAttestation, newCertificateHash: null };
  }
}

async function resealAndAttest(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventIdNum: number,
  ownerId: string,
  redactedBundle: Record<string, unknown>,
  bundleType: string,
  originalCertificateHash: string,
  nodeUrl: string,
  nodeApiKey: string,
  now: string,
): Promise<AutoStampResult> {
  try {
    const snap = redactedBundle.snapshot as Record<string, unknown> | undefined;
    if (!snap) {
      return { autoStampStatus: 'failed', autoStampError: 'No snapshot for reseal', autoStampedAt: now, attestation: null, newCertificateHash: null };
    }

    const version = (redactedBundle.version as string) ?? '0.1';
    const createdAt = (redactedBundle.createdAt as string) ?? now;

    const resealedBundle: Record<string, unknown> = {
      bundleType,
      version,
      createdAt,
      snapshot: JSON.parse(JSON.stringify(snap)),
    };

    const newCertificateHash = await computeCertificateHash(resealedBundle);
    resealedBundle.certificateHash = newCertificateHash;
    resealedBundle.meta = {
      provenance: {
        kind: 'redacted_reseal',
        originalCertificateHash,
        redactedAt: now,
        redactionPolicy: 'Snapshot fields (input, output, prompt) removed during ingestion. New certificateHash computed over redacted payload.',
      },
    };

    const result = await callNodeAttest(supabaseAdmin, eventIdNum, ownerId, resealedBundle, newCertificateHash, nodeUrl, nodeApiKey, 'redacted_reseal', now);

    // Also update certificate_hash to the new resealed one
    if (result.autoStampStatus === 'signed_redacted_reseal') {
      await supabaseAdmin
        .from('cer_bundles')
        .update({ certificate_hash: newCertificateHash })
        .eq('usage_event_id', eventIdNum)
        .eq('user_id', ownerId);
    }

    return { ...result, newCertificateHash };
  } catch (err) {
    const e = err as Error;
    console.error('Auto-stamp reseal error:', e.message);
    return { autoStampStatus: 'failed', autoStampError: e.message.slice(0, 200), autoStampedAt: now, attestation: null, newCertificateHash: null };
  }
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
      certificateHash = await computeCertificateHashLocal(bundle);
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
    const existingAttestation = (attestation ?? bundle.attestation ?? null) as Record<string, unknown> | null;
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
          attestation_json: existingAttestation,
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

    // ── AUTO-STAMP (best-effort, non-blocking for the ingest response) ──
    let autoStampResult: AutoStampResult = {
      autoStampStatus: 'skipped_unknown',
      autoStampError: null,
      autoStampedAt: null,
      attestation: null,
      newCertificateHash: null,
    };

    // Resolve project_id from the bundle or body if provided
    const projectId: string | null = (body.project_id ?? body.projectId ?? bundle.project_id ?? null) as string | null;

    try {
      autoStampResult = await autoStamp(
        supabaseAdmin,
        eventIdNum,
        ownerId,
        redacted,
        bundle, // original pre-redaction bundle for AI verify
        bundleType,
        certificateHash,
        existingAttestation,
        projectId,
      );
      console.info(JSON.stringify({
        action: 'auto_stamp_complete',
        usageEventId: eventIdNum,
        status: autoStampResult.autoStampStatus,
        error: autoStampResult.autoStampError,
      }));
    } catch (autoErr) {
      const e = autoErr as Error;
      console.error('Auto-stamp unexpected error:', e.message);
      autoStampResult = {
        autoStampStatus: 'failed',
        autoStampError: e.message.slice(0, 200),
        autoStampedAt: new Date().toISOString(),
        attestation: null,
        newCertificateHash: null,
      };
    }

    return jsonResp({
      ok: true, usageEventId, bundleType, certificateHash,
      upserted: true, artifactPath: artifactPath ?? null,
      autoStampStatus: autoStampResult.autoStampStatus,
      autoStampError: autoStampResult.autoStampError,
      autoStampedAt: autoStampResult.autoStampedAt,
      newCertificateHash: autoStampResult.newCertificateHash,
    }, 200);
  } catch (err) {
    const e = err as Error;
    console.error('store-cer-bundle error:', e.message);
    return jsonResp({ ok: false, error: 'INTERNAL', message: e.message, upserted: false }, 500);
  }
});
