import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { normalizeForAttestation } from "../_shared/normalize-for-attestation.ts";

// ── Test 1: Already-enveloped record returns unchanged ──
Deno.test("enveloped record passes through unchanged", () => {
  const record = {
    bundleType: "cer.codemode.render.v1",
    version: "1.2.0",
    createdAt: "2025-01-01T00:00:00Z",
    certificateHash: "sha256:abc123",
    snapshot: { seed: 42, canvas: { width: 1950, height: 2400 } },
  };

  const result = normalizeForAttestation(record, "codemode");
  assertEquals(result.ok, true);
  if (!result.ok) return;
  assertEquals(result.legacyWrapped, false);
  assertEquals(result.bundle, record);
  assertEquals(result.certificateHash, "sha256:abc123");
});

// ── Test 2: Legacy flat Code Mode wraps correctly, preserves hash ──
Deno.test("legacy flat codemode wraps into envelope preserving certificateHash", () => {
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
  assertEquals(result.ok, true);
  if (!result.ok) return;
  assertEquals(result.legacyWrapped, true);
  assertEquals(result.certificateHash, "sha256:original_hash_must_be_preserved");
  assertEquals(result.bundle.bundleType, "cer.codemode.render.v1");
  assertEquals(result.bundle.version, "1.2.0");
  assertEquals(result.bundle.createdAt, "2025-01-15T10:30:00Z");
  assertEquals(result.bundle.certificateHash, "sha256:original_hash_must_be_preserved");
  // Snapshot should contain the original flat fields
  const snap = result.bundle.snapshot as Record<string, unknown>;
  assertExists(snap);
  assertEquals(snap.seed, 42);
  assertEquals(snap.codeHash, "sha256:code");
  assertEquals(snap.runtimeHash, "sha256:runtime");
});

// ── Test 3: Missing certificateHash fails ──
Deno.test("missing certificateHash blocks re-attest", () => {
  const record = {
    seed: 42,
    timestamp: "2025-01-15T10:30:00Z",
    bundleType: "cer.codemode.render.v1",
  };

  const result = normalizeForAttestation(record, "codemode", null, null);
  assertEquals(result.ok, false);
  if (result.ok) return;
  assertEquals(result.error, "UNSUPPORTED_LEGACY_FORMAT");
  assertEquals(result.message.includes("certificateHash"), true);
});

// ── Test 4: Missing timestamp/createdAt fails (no "now") ──
Deno.test("missing timestamp blocks re-attest, no now() fabrication", () => {
  const record = {
    seed: 42,
    bundleType: "cer.codemode.render.v1",
    certificateHash: "sha256:abc",
  };

  const result = normalizeForAttestation(record, "codemode");
  assertEquals(result.ok, false);
  if (result.ok) return;
  assertEquals(result.error, "UNSUPPORTED_LEGACY_FORMAT");
  assertEquals(result.message.includes("timestamp"), true);
});

// ── Test 5: Unsupported AI legacy format fails ──
Deno.test("non-enveloped AI record fails with UNSUPPORTED_LEGACY_FORMAT", () => {
  const record = {
    model: "gpt-4",
    input: "hello",
    output: "world",
  };

  const result = normalizeForAttestation(record, "ai");
  assertEquals(result.ok, false);
  if (result.ok) return;
  assertEquals(result.error, "UNSUPPORTED_LEGACY_FORMAT");
});

// ── Test 6: DB fallback for certificateHash works ──
Deno.test("falls back to DB certificateHash when record has none", () => {
  const record = {
    seed: 42,
    timestamp: "2025-01-15T10:30:00Z",
    bundleType: "cer.codemode.render.v1",
  };

  const result = normalizeForAttestation(record, "codemode", "sha256:from_db", null);
  assertEquals(result.ok, true);
  if (!result.ok) return;
  assertEquals(result.legacyWrapped, true);
  assertEquals(result.certificateHash, "sha256:from_db");
});

// ── Test 7: No hashing imports in normalizer ──
Deno.test("normalizeForAttestation source has no hash imports", async () => {
  const source = await Deno.readTextFile(new URL("../_shared/normalize-for-attestation.ts", import.meta.url));
  assertEquals(source.includes("sha256"), false, "Source must not reference sha256");
  assertEquals(source.includes("canonicalize"), false, "Source must not reference canonicalize");
  assertEquals(source.includes("crypto.subtle"), false, "Source must not reference crypto.subtle");
});
