/**
 * Canonical public verification URL generation.
 *
 * Prefers execution-based URLs when executionId exists,
 * falls back to certificateHash URL.
 */

const VERIFY_BASE = "https://verify.nexart.io";

export function getVerificationUrl(opts: {
  executionId?: string | null;
  certificateHash?: string | null;
}): string | null {
  if (opts.executionId) {
    return `${VERIFY_BASE}/e/${encodeURIComponent(opts.executionId)}`;
  }
  if (opts.certificateHash) {
    return `${VERIFY_BASE}/c/${encodeURIComponent(opts.certificateHash)}`;
  }
  return null;
}

/**
 * For use in the current app (same origin), generate internal route paths.
 */
export function getVerificationPath(opts: {
  executionId?: string | null;
  certificateHash?: string | null;
}): string | null {
  if (opts.executionId) {
    return `/e/${encodeURIComponent(opts.executionId)}`;
  }
  if (opts.certificateHash) {
    return `/c/${encodeURIComponent(opts.certificateHash)}`;
  }
  return null;
}
