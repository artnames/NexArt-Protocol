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
    expect(source).not.toMatch(/\bretry\b/i);
    expect(source).not.toContain("backoff");
  });
});
