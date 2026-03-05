/**
 * normalizeForAttestation — pure transport wrapper for legacy flat bundles.
 *
 * CRITICAL: This function MUST NOT import or call any hashing/canonicalization.
 * It is a shape adapter only. All certificate hashes are preserved as-is.
 */

const CODEMODE_BUNDLE_TYPE = 'cer.codemode.render.v1';

export interface NormalizeResult {
  ok: true;
  bundle: Record<string, unknown>;
  legacyWrapped: boolean;
  surface: 'codemode' | 'ai';
  certificateHash: string;
}

export interface NormalizeError {
  ok: false;
  error: string;
  message: string;
}

/**
 * Detect whether a record already has CER envelope shape.
 */
function isEnveloped(record: Record<string, unknown>): boolean {
  return (
    typeof record.bundleType === 'string' &&
    record.snapshot != null &&
    typeof record.snapshot === 'object' &&
    typeof record.certificateHash === 'string'
  );
}

/**
 * Try to derive createdAt from any existing timestamp field.
 * Returns null if none found — caller MUST block (no fabrication).
 */
function deriveCreatedAt(record: Record<string, unknown>): string | null {
  for (const key of ['createdAt', 'timestamp', 'issuedAt', 'created_at']) {
    const val = record[key];
    if (typeof val === 'string' && val.length > 0) return val;
    if (typeof val === 'number' && val > 0) return new Date(val).toISOString();
  }
  return null;
}

/**
 * Derive certificateHash from any existing hash field.
 */
function deriveCertificateHash(record: Record<string, unknown>, dbCertificateHash?: string | null): string | null {
  for (const key of ['certificateHash', 'certificate_hash', 'hash']) {
    const val = record[key];
    if (typeof val === 'string' && val.length > 0) return val;
  }
  if (typeof dbCertificateHash === 'string' && dbCertificateHash.length > 0) return dbCertificateHash;
  return null;
}

/**
 * Normalize a stored record into CER envelope shape for node submission.
 *
 * @param record       - The stored cer_bundle_redacted JSON
 * @param surface      - 'codemode' or 'ai'
 * @param dbHash       - certificate_hash column value (fallback)
 * @param dbBundleType - bundle_type column value (fallback)
 */
export function normalizeForAttestation(
  record: Record<string, unknown>,
  surface: 'codemode' | 'ai',
  dbHash?: string | null,
  dbBundleType?: string | null,
): NormalizeResult | NormalizeError {
  // ── Already enveloped → return as-is ──
  if (isEnveloped(record)) {
    const certHash = record.certificateHash as string;
    return {
      ok: true,
      bundle: record,
      legacyWrapped: false,
      surface,
      certificateHash: certHash,
    };
  }

  // ── Legacy flat Code Mode → wrap ──
  if (surface === 'codemode') {
    const bundleType = (record.bundleType as string) ?? (dbBundleType as string) ?? CODEMODE_BUNDLE_TYPE;
    if (!bundleType) {
      return {
        ok: false,
        error: 'UNSUPPORTED_LEGACY_FORMAT',
        message: 'Cannot determine bundleType for legacy Code Mode record.',
      };
    }

    const createdAt = deriveCreatedAt(record);
    if (!createdAt) {
      return {
        ok: false,
        error: 'UNSUPPORTED_LEGACY_FORMAT',
        message: 'Cannot re-attest legacy record: no timestamp field found (createdAt, timestamp, issuedAt, created_at). Will not fabricate a timestamp.',
      };
    }

    const certificateHash = deriveCertificateHash(record, dbHash);
    if (!certificateHash) {
      return {
        ok: false,
        error: 'UNSUPPORTED_LEGACY_FORMAT',
        message: 'Cannot re-attest legacy record: missing certificateHash (would require reseal).',
      };
    }

    // Copy entire flat record as snapshot — no field modification
    const snapshot = JSON.parse(JSON.stringify(record));

    const envelope: Record<string, unknown> = {
      bundleType,
      version: (record.protocolVersion as string) ?? (record.version as string) ?? '0.1',
      createdAt,
      certificateHash,
      snapshot,
    };

    return {
      ok: true,
      bundle: envelope,
      legacyWrapped: true,
      surface,
      certificateHash,
    };
  }

  // ── Unsupported ──
  return {
    ok: false,
    error: 'UNSUPPORTED_LEGACY_FORMAT',
    message: `Unsupported legacy format for surface "${surface}". Cannot normalize without risking data integrity.`,
  };
}
