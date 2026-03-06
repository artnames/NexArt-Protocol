import { describe, it, expect } from "vitest";
import { normalizeForAttestation } from "./normalize-for-attestation";
import { classifyCERBundle, hasSignedReceipt } from "./cer-classifier";
import * as fs from "fs";
import * as path from "path";

describe("normalizeForAttestation", () => {
  // ── Passthrough ──
  it("passes through already-enveloped record unchanged (same reference)", () => {
    const record = {
      bundleType: "cer.codemode.render.v1",
      version: "1.2.0",
      createdAt: "2025-01-01T00:00:00Z",
      certificateHash: "sha256:abc123",
      snapshot: { seed: 42, canvas: { width: 1950, height: 2400 } },
    };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacyWrapped).toBe(false);
    expect(result.wrapReason).toBeUndefined();
    expect(result.bundle).toBe(record);
    expect(result.certificateHash).toBe("sha256:abc123");
  });

  // ── Legacy wrap preserves hash ──
  it("wraps legacy flat Code Mode record and preserves certificateHash exactly", () => {
    const record = {
      seed: 42,
      canvas: { width: 1950, height: 2400 },
      codeHash: "sha256:code",
      varsHash: "sha256:vars",
      timestamp: "2025-01-15T10:30:00Z",
      bundleType: "cer.codemode.render.v1",
      sdkVersion: "0.2.3",
      contentType: "image/png",
      runtimeHash: "sha256:runtime",
      protocolVersion: "1.2.0",
      certificateHash: "sha256:original_hash_must_be_preserved",
      meta: {},
    };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacyWrapped).toBe(true);
    expect(result.wrapReason).toBe("LEGACY_FLAT_CODEMODE");
    expect(result.certificateHash).toBe("sha256:original_hash_must_be_preserved");
    expect(result.bundle.certificateHash).toBe("sha256:original_hash_must_be_preserved");
  });

  // ── Does not mutate input ──
  it("does not mutate the input record (deepFreeze)", () => {
    function deepFreeze<T extends Record<string, unknown>>(obj: T): T {
      Object.freeze(obj);
      for (const val of Object.values(obj)) {
        if (val && typeof val === 'object' && !Object.isFrozen(val)) {
          deepFreeze(val as Record<string, unknown>);
        }
      }
      return obj;
    }
    const record = deepFreeze({
      seed: 42,
      timestamp: "2025-01-15T10:30:00Z",
      bundleType: "cer.codemode.render.v1",
      certificateHash: "sha256:frozen",
      nested: { a: 1, b: { c: 2 } },
    });
    const before = JSON.stringify(record);
    const result = normalizeForAttestation(record as any, "codemode");
    expect(result.ok).toBe(true);
    expect(JSON.stringify(record)).toBe(before);
  });

  it("blocks re-attest when certificateHash is missing", () => {
    const record = { seed: 42, timestamp: "2025-01-15T10:30:00Z", bundleType: "cer.codemode.render.v1" };
    const result = normalizeForAttestation(record, "codemode", null, null);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect((result as any).error).toBe("MISSING_CERTIFICATE_HASH");
  });

  it("blocks re-attest when no timestamp field exists", () => {
    const record = { seed: 42, bundleType: "cer.codemode.render.v1", certificateHash: "sha256:abc" };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect((result as any).error).toBe("MISSING_CREATED_AT");
  });

  it("defaults bundleType to cer.codemode.render.v1 when not present", () => {
    const record = { seed: 1, timestamp: "2025-01-01T00:00:00Z", certificateHash: "sha256:x" };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.bundleType).toBe("cer.codemode.render.v1");
  });

  it("prefers createdAt over timestamp", () => {
    const record = { seed: 1, createdAt: "2025-01-01T00:00:00Z", timestamp: "2025-06-01T00:00:00Z", certificateHash: "sha256:x" };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.createdAt).toBe("2025-01-01T00:00:00Z");
  });

  it("rejects non-enveloped AI record with UNSUPPORTED_LEGACY_FORMAT", () => {
    const record = { model: "gpt-4", input: "hello", output: "world" };
    const result = normalizeForAttestation(record, "ai");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect((result as any).error).toBe("UNSUPPORTED_LEGACY_FORMAT");
  });

  it("falls back to DB certificateHash when record has none", () => {
    const record = { seed: 42, timestamp: "2025-01-15T10:30:00Z", bundleType: "cer.codemode.render.v1" };
    const result = normalizeForAttestation(record, "codemode", "sha256:from_db", null);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.certificateHash).toBe("sha256:from_db");
  });

  // ── No hash imports in normalizer source ──
  it("normalizer source code contains no hashing imports or functions", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "normalize-for-attestation.ts"), "utf-8");
    expect(source).not.toContain("sha256");
    expect(source).not.toContain("canonicalize");
    expect(source).not.toContain("crypto.subtle");
    expect(source).not.toContain("computeCertificateHash");
  });

  // ── Re-attest function guards ──
  it("re-attest function requires local verify and never overwrites certificateHash", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../../supabase/functions/re-attest/index.ts"), "utf-8");
    expect(source).toContain("LOCAL_VERIFY_FAILED");
    expect(source).toContain("localVerifyCertificateHash");
    expect(source).not.toMatch(/payloadObj\.certificateHash\s*=/);
  });

  // ── Reseal-attest guards ──
  it("reseal-attest function computes new hash and stores provenance", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../../supabase/functions/reseal-attest/index.ts"), "utf-8");
    expect(source).toContain("computeCertificateHash");
    expect(source).toContain("originalCertificateHash");
    expect(source).toContain("redacted_reseal");
  });

  // ── Hash-only never modifies bundle ──
  it("stamp-hash function never modifies bundle content", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../../supabase/functions/stamp-hash/index.ts"), "utf-8");
    expect(source).not.toContain("computeCertificateHash");
    expect(source).not.toContain("cer-hash");
    expect(source).toContain("'hash-only'");
  });

  it("passes enveloped AI record through unchanged", () => {
    const record = {
      bundleType: "cer.ai.execution.v1",
      version: "0.7.0",
      createdAt: "2025-01-01T00:00:00Z",
      certificateHash: "sha256:ai123",
      snapshot: { input: null, output: null, prompt: null, model: "gpt-4" },
    };
    const result = normalizeForAttestation(record, "ai");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacyWrapped).toBe(false);
    expect(result.bundle).toBe(record);
  });
});

// ── CER Classifier tests ──────────────────────────────────────────────

describe("classifyCERBundle", () => {
  it("classifies full AI CER as FULL_CER_VERIFIABLE", () => {
    const bundle = {
      bundleType: "cer.ai.execution.v1",
      version: "0.7.0",
      createdAt: "2025-01-01T00:00:00Z",
      certificateHash: "sha256:abc",
      snapshot: { input: "hello", output: "world", prompt: "test", model: "gpt-4" },
    };
    const result = classifyCERBundle(bundle, null, null, true);
    expect(result.category).toBe("FULL_CER_VERIFIABLE");
    expect(result.surface).toBe("ai");
  });

  it("classifies redacted AI CER as REDACTED_DERIVATIVE", () => {
    const bundle = {
      bundleType: "cer.ai.execution.v1",
      version: "0.7.0",
      createdAt: "2025-01-01T00:00:00Z",
      certificateHash: "sha256:abc",
      snapshot: { model: "gpt-4" }, // input/output/prompt removed
    };
    const result = classifyCERBundle(bundle, null, null, null);
    expect(result.category).toBe("REDACTED_DERIVATIVE");
  });

  it("classifies legacy Code Mode record as LEGACY_INCOMPLETE_RECORD", () => {
    const bundle = {
      bundleType: "cer.codemode.render.v1",
      seed: 42,
      // missing snapshot, inputHash, outputHash, protocolVersion, sdkVersion
    };
    const result = classifyCERBundle(bundle, "cer.codemode.render.v1", "sha256:x", null);
    expect(result.category).toBe("LEGACY_INCOMPLETE_RECORD");
    expect(result.surface).toBe("codemode");
  });

  it("classifies full Code Mode CER as FULL_CER_VERIFIABLE", () => {
    const bundle = {
      bundleType: "cer.codemode.render.v1",
      version: "1.2.0",
      createdAt: "2025-01-01T00:00:00Z",
      certificateHash: "sha256:abc",
      snapshot: {
        inputHash: "sha256:in",
        outputHash: "sha256:out",
        protocolVersion: "1.2.0",
        sdkVersion: "0.2.3",
      },
    };
    const result = classifyCERBundle(bundle, null, null, true);
    expect(result.category).toBe("FULL_CER_VERIFIABLE");
  });

  it("classifies AI bundle with failed local verify as FULL_CER_MISMATCH", () => {
    const bundle = {
      bundleType: "cer.ai.execution.v1",
      certificateHash: "sha256:abc",
      snapshot: { input: "a", output: "b", prompt: "c" },
    };
    const result = classifyCERBundle(bundle, null, null, false);
    expect(result.category).toBe("FULL_CER_MISMATCH");
  });

  it("classifies unknown bundleType as UNKNOWN", () => {
    const bundle = { bundleType: "cer.other.v99" };
    const result = classifyCERBundle(bundle, null, null, null);
    expect(result.category).toBe("UNKNOWN");
  });
});

// ── hasSignedReceipt tests ──────────────────────────────────────────

describe("hasSignedReceipt", () => {
  it("returns false for null", () => {
    expect(hasSignedReceipt(null)).toBe(false);
  });

  it("returns false for attestation without receipt", () => {
    expect(hasSignedReceipt({ attestationId: "abc" })).toBe(false);
  });

  it("returns true for attestation with receipt and signature", () => {
    expect(hasSignedReceipt({ receipt: "abc", signatureB64Url: "def" })).toBe(true);
  });
});

// ── Auto-stamp source code invariants ──────────────────────────────

describe("auto-stamp invariants (source-level)", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../../supabase/functions/store-cer-bundle/index.ts"),
    "utf-8",
  );

  it("uses classifyCERBundle for decision logic", () => {
    expect(source).toContain("classifyCERBundle");
    expect(source).toContain("cer-classifier");
  });

  it("uses hasSignedReceipt to prevent double-stamping", () => {
    expect(source).toContain("hasSignedReceipt");
    expect(source).toContain("already_signed");
  });

  it("requires localVerifyCertificateHash before calling node", () => {
    expect(source).toContain("localVerifyCertificateHash");
  });

  it("marks auto-stamped attestations with autoStamped: true", () => {
    expect(source).toContain("autoStamped: true");
  });

  it("never fails the ingest on auto-stamp failure (best-effort)", () => {
    expect(source).toContain("auto_stamp_complete");
    expect(source).toContain("autoStampStatus: 'failed'");
    expect(source).toContain("upserted: true, artifactPath");
  });

  it("skips legacy Code Mode records (skipped_legacy_code)", () => {
    expect(source).toContain("skipped_legacy_code");
  });

  it("skips unverifiable AI records (skipped_unverifiable_ai)", () => {
    expect(source).toContain("skipped_unverifiable_ai");
  });

  it("uses computeCertificateHash only in reseal path, not for full re-attest", () => {
    expect(source).toContain("computeCertificateHash");
    expect(source).toContain("payloadObj.certificateHash ?? certificateHash");
  });

  // ── Feature flag tests ──

  it("checks AUTO_STAMP_ENABLED feature flag before making node calls", () => {
    expect(source).toContain("AUTO_STAMP_ENABLED");
    expect(source).toContain("isAutoStampEnabled");
    expect(source).toContain("skipped_disabled");
  });

  it("supports per-surface flags AUTO_STAMP_AI_ENABLED and AUTO_STAMP_CODEMODE_ENABLED", () => {
    expect(source).toContain("AUTO_STAMP_AI_ENABLED");
    expect(source).toContain("AUTO_STAMP_CODEMODE_ENABLED");
  });

  it("defaults feature flag to disabled (false)", () => {
    // The code checks if master !== 'true' → return false
    expect(source).toContain("!== 'true'");
    expect(source).toContain("return false");
  });

  // ── Timeout tests ──

  it("uses AbortController with strict timeout for node calls", () => {
    expect(source).toContain("AbortController");
    expect(source).toContain("AUTO_STAMP_TIMEOUT_MS");
    expect(source).toContain("controller.abort()");
    expect(source).toContain("signal: controller.signal");
  });

  it("handles timeout as a specific failure reason", () => {
    expect(source).toContain("AbortError");
    expect(source).toContain("? 'timeout' : 'node_error'");
  });

  it("persists failure attestation on timeout so UI can display it", () => {
    expect(source).toContain("status: 'failed'");
    expect(source).toContain("failedAt:");
  });

  it("never retries node calls inside ingest (no retry loop)", () => {
    expect(source).not.toContain("retryCount");
    expect(source).not.toContain("backoff");
    expect(source).not.toContain("maxRetries");
  });

  // ── Rate limiter tests ──

  it("has an in-memory rate limiter with skipped_rate_limited status", () => {
    expect(source).toContain("isRateLimited");
    expect(source).toContain("skipped_rate_limited");
    expect(source).toContain("AUTO_STAMP_RATE_MAX");
    expect(source).toContain("AUTO_STAMP_RATE_WINDOW_MS");
  });

  it("rate limiter runs before feature flag and node calls", () => {
    const rateLimitedIdx = source.indexOf("isRateLimited(ownerId)");
    const featureFlagIdx = source.indexOf("isAutoStampEnabled(classification.surface)");
    expect(rateLimitedIdx).toBeGreaterThan(0);
    expect(featureFlagIdx).toBeGreaterThan(rateLimitedIdx);
  });
});

// ── stamp-hash source invariants ──────────────────────────────────

describe("stamp-hash invariants (source-level)", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../../supabase/functions/stamp-hash/index.ts"),
    "utf-8",
  );

  it("calls /api/stamp-hash endpoint (not /api/stamp)", () => {
    expect(source).toContain("/api/stamp-hash");
    expect(source).not.toContain('`${nodeUrl}/api/stamp`');
  });

  it("sends only certificateHash in the payload (no bundleType, surface, mode)", () => {
    expect(source).toContain("const stampPayload = { certificateHash }");
  });

  it("persists attestation with autoStamped: false", () => {
    expect(source).toContain("autoStamped: false");
  });

  it("persists attestation with mode: 'hash-only' and status: 'ok'", () => {
    expect(source).toContain("mode: 'hash-only'");
    expect(source).toContain("status: 'ok'");
  });

  it("stores receipt, signatureB64Url, and attestorKeyId from node response", () => {
    expect(source).toContain("receipt: src.receipt");
    expect(source).toContain("signatureB64Url: src.signatureB64Url");
    expect(source).toContain("attestorKeyId: src.attestorKeyId");
  });

  it("returns NODE_HASH_ONLY_UNSUPPORTED for 400/404/422 errors", () => {
    expect(source).toContain("NODE_HASH_ONLY_UNSUPPORTED");
    expect(source).toContain("nodeResp.status === 404");
  });

  it("never modifies bundle content (no computeCertificateHash)", () => {
    expect(source).not.toContain("computeCertificateHash");
    expect(source).not.toContain("cer-hash");
  });

  it("legacy Code Mode record can get hash-only stamp without snapshot fields", () => {
    // The stamp-hash function only reads certificateHash from the stored bundle,
    // it never requires or sends snapshot, inputHash, outputHash, or sdkVersion in the payload
    expect(source).not.toMatch(/stampPayload.*snapshot/);
    expect(source).not.toMatch(/stampPayload.*inputHash/);
    expect(source).not.toMatch(/stampPayload.*outputHash/);
    expect(source).not.toMatch(/stampPayload.*sdkVersion/);
  });
});

// ── Export: legacy codemode with hash-only attestation ────────────

describe("enrichEventWithStoredBundle: legacy code + hash-only receipt", () => {
  // Source-level test: enrichEventWithStoredBundle merges attestation for legacy records
  it("certified-records-types merges attestation into rawBundleJson.meta.attestation for legacy records", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/dashboard/certified-records-types.ts"),
      "utf-8",
    );
    // The else-if branch that handles legacy records without snapshot/bundleType
    expect(source).toContain("else if (attestation)");
    expect(source).toContain("meta.attestation so downloads include signed receipts");
    // Ensures meta.attestation is set on rawBundleJson
    expect(source).toContain("attestation,");
  });

  it("enrichEventWithStoredBundle source preserves legacy classification (no reseal, no recompute)", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/dashboard/certified-records-types.ts"),
      "utf-8",
    );
    // The else-if branch must NOT call buildVerifiableExportBundle or computeCertificateHash
    // It only merges attestation — the legacy record stays as-is
    const elseIfBlock = source.substring(
      source.indexOf("else if (attestation)"),
      source.indexOf("// For render bundles with a stored bundle"),
    );
    expect(elseIfBlock).not.toContain("computeCertificateHash");
    expect(elseIfBlock).not.toContain("buildVerifiableExportBundle");
    expect(elseIfBlock).not.toContain("recomputedHash");
  });
});

// ── classifier: legacy codemode must not be MISMATCH ──────────────

describe("classifier: legacy codemode stays LEGACY not MISMATCH", () => {
  it("legacy codemode without envelope is LEGACY_INCOMPLETE_RECORD regardless of localVerify", () => {
    const bundle = {
      bundleType: "cer.codemode.render.v1",
      seed: 42,
    };
    const result = classifyCERBundle(bundle, "cer.codemode.render.v1", "sha256:x", false);
    expect(result.category).toBe("LEGACY_INCOMPLETE_RECORD");
    expect(result.category).not.toBe("FULL_CER_MISMATCH");
  });
});
