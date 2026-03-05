import { describe, it, expect } from "vitest";
import { normalizeForAttestation } from "./normalize-for-attestation";
import * as fs from "fs";
import * as path from "path";

describe("normalizeForAttestation", () => {
  it("passes through already-enveloped record unchanged", () => {
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
    expect(result.bundle).toBe(record); // same reference
    expect(result.certificateHash).toBe("sha256:abc123");
  });

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
    expect(result.certificateHash).toBe("sha256:original_hash_must_be_preserved");
    expect(result.bundle.bundleType).toBe("cer.codemode.render.v1");
    expect(result.bundle.version).toBe("1.2.0");
    expect(result.bundle.createdAt).toBe("2025-01-15T10:30:00Z");
    expect(result.bundle.certificateHash).toBe("sha256:original_hash_must_be_preserved");
    const snap = result.bundle.snapshot as Record<string, unknown>;
    expect(snap.seed).toBe(42);
    expect(snap.codeHash).toBe("sha256:code");
  });

  it("blocks re-attest when certificateHash is missing", () => {
    const record = { seed: 42, timestamp: "2025-01-15T10:30:00Z", bundleType: "cer.codemode.render.v1" };
    const result = normalizeForAttestation(record, "codemode", null, null);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("UNSUPPORTED_LEGACY_FORMAT");
    expect(result.message).toContain("certificateHash");
  });

  it("blocks re-attest when no timestamp field exists (no now() fabrication)", () => {
    const record = { seed: 42, bundleType: "cer.codemode.render.v1", certificateHash: "sha256:abc" };
    const result = normalizeForAttestation(record, "codemode");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("UNSUPPORTED_LEGACY_FORMAT");
    expect(result.message).toContain("timestamp");
  });

  it("rejects non-enveloped AI record", () => {
    const record = { model: "gpt-4", input: "hello", output: "world" };
    const result = normalizeForAttestation(record, "ai");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("UNSUPPORTED_LEGACY_FORMAT");
  });

  it("falls back to DB certificateHash", () => {
    const record = { seed: 42, timestamp: "2025-01-15T10:30:00Z", bundleType: "cer.codemode.render.v1" };
    const result = normalizeForAttestation(record, "codemode", "sha256:from_db", null);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.certificateHash).toBe("sha256:from_db");
  });

  it("source code contains no hashing imports", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "normalize-for-attestation.ts"),
      "utf-8",
    );
    expect(source).not.toContain("sha256");
    expect(source).not.toContain("canonicalize");
    expect(source).not.toContain("crypto.subtle");
  });
});
