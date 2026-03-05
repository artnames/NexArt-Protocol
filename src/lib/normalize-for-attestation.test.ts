import { describe, it, expect } from "vitest";
import { normalizeForAttestation } from "./normalize-for-attestation";
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
    expect(result.bundle).toBe(record); // same reference, no clone
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
    expect(result.bundle.bundleType).toBe("cer.codemode.render.v1");
    expect(result.bundle.version).toBe("1.2.0");
    expect(result.bundle.createdAt).toBe("2025-01-15T10:30:00Z");
    expect(result.bundle.certificateHash).toBe("sha256:original_hash_must_be_preserved");
    const snap = result.bundle.snapshot as Record<string, unknown>;
    expect(snap.seed).toBe(42);
    expect(snap.codeHash).toBe("sha256:code");
    expect(snap.runtimeHash).toBe("sha256:runtime");
  });

  // ── Does not mutate input (deepFreeze) ──
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

  // ── Missing certificateHash ──
  it("blocks re-attest when certificateHash is missing (MISSING_CERTIFICATE_HASH)", () => {
    const record = { seed: 42, timestamp: "2025-01-15T10:30:00Z", bundleType: "cer.codemode.render.v1" };
    const result = normalizeForAttestation(record, "codemode", null, null);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect((result as any).error).toBe("MISSING_CERTIFICATE_HASH");
  });

  // ── Missing timestamp ──
  it("blocks re-attest when no timestamp field exists (MISSING_CREATED_AT)", () => {
    const record = { seed: 42, bundleType: "cer.codemode.render.v1", certificateHash: "sha256:abc" };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect((result as any).error).toBe("MISSING_CREATED_AT");
  });

  // ── bundleType preference ──
  it("uses existing bundleType from legacy record when present", () => {
    const record = {
      seed: 1,
      timestamp: "2025-01-01T00:00:00Z",
      bundleType: "cer.codemode.render.v1",
      certificateHash: "sha256:x",
    };
    const result = normalizeForAttestation(record, "codemode", null, "cer.codemode.render.v1");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.bundleType).toBe("cer.codemode.render.v1");
  });

  it("defaults bundleType to cer.codemode.render.v1 when not present", () => {
    const record = {
      seed: 1,
      timestamp: "2025-01-01T00:00:00Z",
      certificateHash: "sha256:x",
    };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.bundleType).toBe("cer.codemode.render.v1");
  });

  it("prefers record.bundleType over dbBundleType", () => {
    const record = {
      seed: 1,
      timestamp: "2025-01-01T00:00:00Z",
      certificateHash: "sha256:x",
      bundleType: "cer.codemode.render.v1",
    };
    const result = normalizeForAttestation(record, "codemode", null, "cer.other.v1");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.bundleType).toBe("cer.codemode.render.v1");
  });

  // ── createdAt derivation order ──
  it("prefers createdAt over timestamp", () => {
    const record = {
      seed: 1,
      createdAt: "2025-01-01T00:00:00Z",
      timestamp: "2025-06-01T00:00:00Z",
      certificateHash: "sha256:x",
    };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.createdAt).toBe("2025-01-01T00:00:00Z");
  });

  it("falls back to timestamp when createdAt missing", () => {
    const record = {
      seed: 1,
      timestamp: "2025-02-01T00:00:00Z",
      certificateHash: "sha256:x",
    };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.createdAt).toBe("2025-02-01T00:00:00Z");
  });

  it("falls back to issuedAt", () => {
    const record = {
      seed: 1,
      issuedAt: "2025-03-01T00:00:00Z",
      certificateHash: "sha256:x",
    };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.createdAt).toBe("2025-03-01T00:00:00Z");
  });

  it("falls back to created_at as last resort", () => {
    const record = {
      seed: 1,
      created_at: "2025-04-01T00:00:00Z",
      certificateHash: "sha256:x",
    };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bundle.createdAt).toBe("2025-04-01T00:00:00Z");
  });

  // ── Never fabricates now ──
  it("never sets createdAt to current time when missing", () => {
    const record = { seed: 42, bundleType: "cer.codemode.render.v1", certificateHash: "sha256:abc" };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(false);
  });

  // ── Unsupported AI legacy ──
  it("rejects non-enveloped AI record with UNSUPPORTED_LEGACY_FORMAT", () => {
    const record = { model: "gpt-4", input: "hello", output: "world" };
    const result = normalizeForAttestation(record, "ai");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect((result as any).error).toBe("UNSUPPORTED_LEGACY_FORMAT");
  });

  // ── DB fallback ──
  it("falls back to DB certificateHash when record has none", () => {
    const record = { seed: 42, timestamp: "2025-01-15T10:30:00Z", bundleType: "cer.codemode.render.v1" };
    const result = normalizeForAttestation(record, "codemode", "sha256:from_db", null);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.certificateHash).toBe("sha256:from_db");
  });

  // ── No hash imports in normalizer source ──
  it("normalizer source code contains no hashing imports or functions", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "normalize-for-attestation.ts"),
      "utf-8",
    );
    expect(source).not.toContain("sha256");
    expect(source).not.toContain("canonicalize");
    expect(source).not.toContain("crypto.subtle");
    expect(source).not.toContain("computeCertificateHash");
  });

  // ── Re-attest edge function does NOT use computeCertificateHash ──
  it("re-attest edge function uses computeCertificateHash only for local verification, not for mutation", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/functions/re-attest/index.ts"),
      "utf-8",
    );
    // It imports cer-hash for local verify, but never overwrites certificateHash on the payload
    expect(source).toContain("localVerifyCertificateHash");
    // Must not contain payloadObj.certificateHash = recomputed (the old pattern)
    expect(source).not.toContain("payloadObj.certificateHash = recomputed");
    expect(source).not.toContain("payloadObj.certificateHash = await");
  });

  // ── Enveloped AI record passes through unchanged ──
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

  // ── Re-attest full never reseals (requires local verify) ──
  it("re-attest function requires local verify before calling node", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/functions/re-attest/index.ts"),
      "utf-8",
    );
    // Must contain local verify check
    expect(source).toContain("LOCAL_VERIFY_FAILED");
    expect(source).toContain("localVerifyCertificateHash");
    // Must NOT overwrite certificateHash on payload
    expect(source).not.toMatch(/payloadObj\.certificateHash\s*=/);
  });

  // ── Reseal-attest produces new certificateHash and preserves provenance ──
  it("reseal-attest function computes new hash and stores provenance", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/functions/reseal-attest/index.ts"),
      "utf-8",
    );
    expect(source).toContain("computeCertificateHash");
    expect(source).toContain("originalCertificateHash");
    expect(source).toContain("redacted_reseal");
    expect(source).toContain("redactionPolicy");
  });

  // ── Hash-only timestamp never alters integrity ──
  it("stamp-hash function never modifies bundle content", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/functions/stamp-hash/index.ts"),
      "utf-8",
    );
    // Must not import or use computeCertificateHash
    expect(source).not.toContain("computeCertificateHash");
    expect(source).not.toContain("cer-hash");
    // Mode must be hash-only
    expect(source).toContain("'hash-only'");
  });
});
