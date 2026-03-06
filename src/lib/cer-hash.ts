/**
 * Browser-compatible certificate hash computation for CER bundles.
 * Used to recompute hashes over redacted payloads for verifiable exports.
 */

export function canonicalize(value: unknown): string {
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

/**
 * Compute certificateHash = sha256(canonicalJson({ bundleType, version, createdAt, snapshot }))
 * Attestation/meta fields are excluded by design.
 */
export async function computeCertificateHash(bundle: Record<string, unknown>): Promise<string> {
  const hashInput = {
    bundleType: bundle.bundleType,
    createdAt: bundle.createdAt,
    snapshot: bundle.snapshot,
    version: bundle.version,
  };
  const canonical = canonicalize(hashInput);
  return `sha256:${await sha256Hex(canonical)}`;
}
