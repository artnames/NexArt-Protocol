/**
 * Browser-only CER bundle verification.
 * No data leaves the browser — all verification uses WebCrypto.
 *
 * Shared by:  /verify page, dashboard CER drawer
 */

import { computeCertificateHash, canonicalize } from "./cer-hash";

// ── Reason codes (aligned with @nexart/ai-execution) ────────────────

export type ReasonCode =
  | "OK"
  | "CERTIFICATE_HASH_MISMATCH"
  | "CANONICALIZATION_ERROR"
  | "SCHEMA_ERROR"
  | "INVALID_SHA256_FORMAT"
  | "UNSUPPORTED_BUNDLE_TYPE"
  | "STAMP_LEGACY"
  | "STAMP_VERIFIED"
  | "STAMP_INVALID"
  | "STAMP_KEY_FETCH_FAILED"
  | "STAMP_NOT_PRESENT";

export interface VerifyResult {
  /** Overall pass/fail */
  ok: boolean;
  /** Machine-readable reason code */
  reason: ReasonCode;
  /** Human-readable explanation (no crypto jargon) */
  explanation: string;
  /** Computed certificate hash */
  computedHash: string | null;
  /** Recorded certificate hash from bundle */
  recordedHash: string | null;
  /** Technical detail string */
  detail: string | null;
  /** Parsed metadata for display */
  meta: {
    bundleType: string | null;
    createdAt: string | null;
    appId: string | null;
    provider: string | null;
    model: string | null;
    executionId: string | null;
    protocolVersion: string | null;
  };
}

export interface StampVerifyResult {
  ok: boolean;
  reason: ReasonCode;
  explanation: string;
  detail: string | null;
  /** Debug info for signature verification diagnostics */
  debug?: {
    receiptType: string;
    receiptPreview: string;
    signaturePreview: string;
    kidUsed: string;
    nodeUrlUsed: string;
    keyFormat: string;
  };
}

const SUPPORTED_BUNDLE_TYPES = [
  "cer.ai.execution.v1",
  "cer.codemode.render.v1",
];

// ── Certificate hash verification ───────────────────────────────────

export async function verifyBundle(input: unknown): Promise<VerifyResult> {
  const emptyMeta = {
    bundleType: null, createdAt: null, appId: null,
    provider: null, model: null, executionId: null, protocolVersion: null,
  };

  // Schema check
  if (!input || typeof input !== "object") {
    return {
      ok: false, reason: "SCHEMA_ERROR",
      explanation: "The input is not a valid JSON object.",
      computedHash: null, recordedHash: null,
      detail: "Expected a JSON object at the top level.",
      meta: emptyMeta,
    };
  }

  const bundle = input as Record<string, unknown>;
  const bundleType = bundle.bundleType as string | undefined;

  if (!bundleType) {
    return {
      ok: false, reason: "SCHEMA_ERROR",
      explanation: "This file is missing a 'bundleType' field and cannot be verified.",
      computedHash: null, recordedHash: null,
      detail: "Required field 'bundleType' is absent.",
      meta: emptyMeta,
    };
  }

  if (!SUPPORTED_BUNDLE_TYPES.includes(bundleType)) {
    return {
      ok: false, reason: "UNSUPPORTED_BUNDLE_TYPE",
      explanation: `Record type "${bundleType}" is not supported. Supported types: ${SUPPORTED_BUNDLE_TYPES.join(", ")}.`,
      computedHash: null, recordedHash: null,
      detail: `bundleType="${bundleType}" is not a recognized CER format.`,
      meta: { ...emptyMeta, bundleType },
    };
  }

  const recordedHash = bundle.certificateHash as string | undefined;
  if (!recordedHash) {
    return {
      ok: false, reason: "SCHEMA_ERROR",
      explanation: "This record is missing its certificate hash and cannot be verified.",
      computedHash: null, recordedHash: null,
      detail: "Required field 'certificateHash' is absent.",
      meta: { ...emptyMeta, bundleType },
    };
  }

  if (!recordedHash.startsWith("sha256:")) {
    return {
      ok: false, reason: "INVALID_SHA256_FORMAT",
      explanation: "The certificate hash format is invalid. Expected a SHA-256 prefixed hash.",
      computedHash: null, recordedHash,
      detail: `certificateHash="${recordedHash}" does not start with "sha256:".`,
      meta: { ...emptyMeta, bundleType },
    };
  }

  // Extract display metadata
  const snap = bundle.snapshot as Record<string, unknown> | undefined;
  const meta = {
    bundleType,
    createdAt: (bundle.createdAt as string) ?? null,
    appId: (snap?.appId as string) ?? null,
    provider: (snap?.provider as string) ?? null,
    model: (snap?.model as string) ?? null,
    executionId: (snap?.executionId as string) ?? null,
    protocolVersion: (snap?.protocolVersion as string) ?? null,
  };

  // Compute hash
  let computedHash: string;
  try {
    computedHash = await computeCertificateHash({
      bundleType: bundle.bundleType,
      version: bundle.version,
      createdAt: bundle.createdAt,
      snapshot: bundle.snapshot,
    });
  } catch (err) {
    return {
      ok: false, reason: "CANONICALIZATION_ERROR",
      explanation: "Failed to compute the certificate hash. The record may contain unsupported data types.",
      computedHash: null, recordedHash,
      detail: `Canonicalization error: ${(err as Error).message}`,
      meta,
    };
  }

  if (computedHash !== recordedHash) {
    return {
      ok: false, reason: "CERTIFICATE_HASH_MISMATCH",
      explanation: "This record has been modified since it was sealed. The computed hash does not match the recorded hash.",
      computedHash, recordedHash,
      detail: `Computed: ${computedHash}\nRecorded: ${recordedHash}`,
      meta,
    };
  }

  return {
    ok: true, reason: "OK",
    explanation: "This record is intact. The certificate hash matches the sealed payload.",
    computedHash, recordedHash,
    detail: null,
    meta,
  };
}

// ── Stamp (node attestation) verification ───────────────────────────

interface NodeKeys {
  keys: Array<{
    kid: string;
    publicKeyJwk?: JsonWebKey;
    publicKeySpkiB64?: string;
    publicKey?: string;
  }>;
  activeKid?: string;
}

async function importEd25519PublicKey(key: NodeKeys["keys"][0]): Promise<CryptoKey | null> {
  try {
    if (key.publicKeyJwk) {
      return await crypto.subtle.importKey(
        "jwk", key.publicKeyJwk,
        { name: "Ed25519" }, false, ["verify"],
      );
    }
    if (key.publicKeySpkiB64) {
      const spkiBytes = Uint8Array.from(atob(key.publicKeySpkiB64), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        "spki", spkiBytes,
        { name: "Ed25519" }, false, ["verify"],
      );
    }
    return null;
  } catch {
    return null;
  }
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Uint8Array.from(atob(b64 + pad), c => c.charCodeAt(0));
}

export function getStampFields(bundle: Record<string, unknown>): {
  hasStamp: boolean;
  isSigned: boolean;
  isLegacy: boolean;
  attestation: Record<string, unknown> | null;
} {
  // Check meta.attestation first, then top-level attestation
  const meta = bundle.meta as Record<string, unknown> | undefined;
  const att = (meta?.attestation ?? bundle.attestation ?? null) as Record<string, unknown> | null;

  if (!att) {
    return { hasStamp: false, isSigned: false, isLegacy: false, attestation: null };
  }

  const hasReceipt = !!att.receipt && !!att.signatureB64Url && !!att.attestorKeyId;
  const hasLegacy = !!(att.attestationId || att.nodeRuntimeHash || att.hash);

  return {
    hasStamp: hasReceipt || hasLegacy,
    isSigned: hasReceipt,
    isLegacy: hasLegacy && !hasReceipt,
    attestation: att,
  };
}

export async function verifyStamp(
  bundle: Record<string, unknown>,
  nodeUrl: string = "https://node.nexart.io",
): Promise<StampVerifyResult> {
  const { hasStamp, isSigned, isLegacy, attestation } = getStampFields(bundle);

  if (!hasStamp || !attestation) {
    return {
      ok: false, reason: "STAMP_NOT_PRESENT",
      explanation: "No attestation stamp is present on this record.",
      detail: null,
    };
  }

  if (isLegacy) {
    return {
      ok: false, reason: "STAMP_LEGACY",
      explanation: "This record has a legacy attestation stamp. Legacy stamps cannot be verified offline — they require contacting the attestation node.",
      detail: `attestationId=${attestation.attestationId ?? "—"}, nodeRuntimeHash=${attestation.nodeRuntimeHash ?? "—"}`,
    };
  }

  if (!isSigned) {
    return {
      ok: false, reason: "STAMP_NOT_PRESENT",
      explanation: "Attestation fields are incomplete for offline verification.",
      detail: null,
    };
  }

  // Fetch node keys
  let nodeKeys: NodeKeys;
  try {
    const resp = await fetch(`${nodeUrl}/.well-known/nexart-node.json`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    nodeKeys = await resp.json();
  } catch (err) {
    return {
      ok: false, reason: "STAMP_KEY_FETCH_FAILED",
      explanation: "Could not fetch the node's public keys to verify the stamp. The node may be temporarily unavailable.",
      detail: `Failed to fetch ${nodeUrl}/.well-known/nexart-node.json: ${(err as Error).message}`,
    };
  }

  // Find the right key
  const kid = attestation.attestorKeyId as string;
  const keyEntry = nodeKeys.keys?.find(k => k.kid === kid)
    ?? (nodeKeys.activeKid ? nodeKeys.keys?.find(k => k.kid === nodeKeys.activeKid) : null)
    ?? nodeKeys.keys?.[0];

  if (!keyEntry) {
    return {
      ok: false, reason: "STAMP_KEY_FETCH_FAILED",
      explanation: "The node's key directory does not contain a matching key for this stamp.",
      detail: `kid="${kid}" not found in node key set.`,
    };
  }

  const publicKey = await importEd25519PublicKey(keyEntry);
  if (!publicKey) {
    return {
      ok: false, reason: "STAMP_KEY_FETCH_FAILED",
      explanation: "Could not import the node's public key. The key format may be unsupported in this browser.",
      detail: `Failed to import key kid="${keyEntry.kid}".`,
    };
  }

  // Verify signature
  // Receipt may be a string (as signed) or an object (JSONB deserialized it).
  // The node signs the receipt as a compact JSON string, so if we get an object,
  // we must re-serialize it to match what was originally signed.
  const receiptRaw = attestation.receipt;
  const receiptString: string =
    typeof receiptRaw === "string"
      ? receiptRaw
      : JSON.stringify(receiptRaw);

  const sigRaw = (attestation.signatureB64Url ?? attestation.signature) as string;
  const signatureBytes = base64UrlToBytes(sigRaw);
  const receiptBytes = new TextEncoder().encode(receiptString);
  // Create ArrayBuffer views compatible with WebCrypto
  const sigBuffer = new Uint8Array(signatureBytes).buffer as ArrayBuffer;
  const dataBuffer = new Uint8Array(receiptBytes).buffer as ArrayBuffer;

  const keyFormat = keyEntry.publicKeyJwk ? "jwk" : keyEntry.publicKeySpkiB64 ? "spki" : "unknown";
  const debug = {
    receiptType: typeof receiptRaw,
    receiptPreview: receiptString.slice(0, 80) + (receiptString.length > 80 ? "…" : ""),
    signaturePreview: sigRaw ? `${sigRaw.slice(0, 8)}…${sigRaw.slice(-8)}` : "—",
    kidUsed: keyEntry.kid,
    nodeUrlUsed: nodeUrl,
    keyFormat,
  };

  try {
    const valid = await crypto.subtle.verify(
      { name: "Ed25519" },
      publicKey,
      sigBuffer,
      dataBuffer,
    );

    if (valid) {
      return {
        ok: true, reason: "STAMP_VERIFIED",
        explanation: "The node's digital signature on this record has been verified offline. The attestation is authentic.",
        detail: `kid="${kid}", signature valid.`,
        debug,
      };
    }
    return {
      ok: false, reason: "STAMP_INVALID",
      explanation: "The node's digital signature does not match. The attestation may have been tampered with.",
      detail: `kid="${kid}", signature INVALID.`,
      debug,
    };
  } catch (err) {
    return {
      ok: false, reason: "STAMP_INVALID",
      explanation: "Signature verification failed. This browser may not support the required cryptographic operations.",
      detail: (err as Error).message,
      debug,
    };
  }
}
