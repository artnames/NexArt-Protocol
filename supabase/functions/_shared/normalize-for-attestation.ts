/**
 * normalizeForAttestation — pure transport wrapper for legacy flat bundles.
 *
 * CRITICAL: This function MUST NOT import or call any hashing/canonicalization.
 * It is a shape adapter only. All certificate hashes are preserved as-is.
 * It MUST NOT mutate the input record.
 */

const CODEMODE_BUNDLE_TYPE = 'cer.codemode.render.v1';

export interface NormalizeResult {
  ok: true;
  bundle: Record<string, unknown>;
  legacyWrapped: boolean;
  wrapReason?: string;
  surface: 'codemode' | 'ai';
  certificateHash: string;
}

export interface NormalizeError {
  ok: false;
  error: string;
  message: string;
}

function isEnveloped(record: Record<string, unknown>): boolean {
  return (
    typeof record.bundleType === 'string' &&
    typeof record.certificateHash === 'string' &&
    typeof record.createdAt === 'string' &&
    record.snapshot != null &&
    typeof record.snapshot === 'object'
  );
}

/**
 * Derive createdAt deterministically from existing fields.
 * Priority: createdAt > timestamp > issuedAt > created_at
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

function deriveCertificateHash(record: Record<string, unknown>, dbCertificateHash?: string | null): string | null {
  for (const key of ['certificateHash', 'certificate_hash', 'hash']) {
    const val = record[key];
    if (typeof val === 'string' && val.length > 0) return val;
  }
  if (typeof dbCertificateHash === 'string' && dbCertificateHash.length > 0) return dbCertificateHash;
  return null;
}

export function normalizeForAttestation(
  record: Record<string, unknown>,
  surface: 'codemode' | 'ai',
  dbHash?: string | null,
  dbBundleType?: string | null,
): NormalizeResult | NormalizeError {
  // ── Already enveloped → return as-is (no mutation, no clone) ──
  if (isEnveloped(record)) {
    return {
      ok: true,
      bundle: record,
      legacyWrapped: false,
      surface,
      certificateHash: record.certificateHash as string,
    };
  }

  // ── Legacy flat Code Mode → transport wrap ──
  if (surface === 'codemode') {
    const bundleType = (record.bundleType as string | undefined) ?? (dbBundleType as string | undefined) ?? CODEMODE_BUNDLE_TYPE;

    const certificateHash = deriveCertificateHash(record, dbHash);
    if (!certificateHash) {
      return {
        ok: false,
        error: 'MISSING_CERTIFICATE_HASH',
        message: 'Cannot re-attest legacy record: missing certificateHash (would require reseal).',
      };
    }

    const createdAt = deriveCreatedAt(record);
    if (!createdAt) {
      return {
        ok: false,
        error: 'MISSING_CREATED_AT',
        message: 'Cannot re-attest legacy record: no timestamp field found (createdAt, timestamp, issuedAt, created_at). Will not fabricate a timestamp.',
      };
    }

    // Deep clone entire input as snapshot — never mutate the original
    const snapshot = JSON.parse(JSON.stringify(record));

    return {
      ok: true,
      bundle: {
        bundleType,
        version: (record.version as string | undefined) ?? (record.protocolVersion as string | undefined) ?? '0.1',
        createdAt,
        certificateHash,
        snapshot,
      },
      legacyWrapped: true,
      wrapReason: 'LEGACY_FLAT_CODEMODE',
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
