import { describe, it, expect } from "vitest";
import {
  _deriveSurface as deriveSurface,
  normalizeCertifiedRecord,
  enrichEventWithCER,
} from "@/components/dashboard/certified-records-types";
import type { UsageEvent } from "@/lib/api";

// ── deriveSurface ──────────────────────────────────────────────────

describe("deriveSurface", () => {
  it("classifies /api/attest as ai", () => {
    expect(deriveSurface("/api/attest")).toBe("ai");
  });

  it("classifies /v1/cer/ai/create as ai", () => {
    expect(deriveSurface("/v1/cer/ai/create")).toBe("ai");
  });

  it("classifies /v1/cer/ai/certify as ai", () => {
    expect(deriveSurface("/v1/cer/ai/certify")).toBe("ai");
  });

  it("classifies /api/render as code", () => {
    expect(deriveSurface("/api/render")).toBe("code");
  });

  it("classifies undefined as code", () => {
    expect(deriveSurface(undefined)).toBe("code");
  });

  it("classifies /api/stamp-hash as ai", () => {
    expect(deriveSurface("/api/stamp-hash")).toBe("ai");
  });

  it("does not classify random endpoints as ai", () => {
    expect(deriveSurface("/api/health")).toBe("code");
  });
});

// ── normalizeCertifiedRecord for v1 AI endpoints ───────────────────

function makeEvent(endpoint: string, statusCode = 200): UsageEvent {
  return {
    id: "evt-1",
    created_at: "2025-01-01T00:00:00Z",
    endpoint,
    status_code: statusCode,
    duration_ms: 120,
    error_code: null,
    key_label: "test",
  };
}

describe("normalizeCertifiedRecord – v1 AI endpoints", () => {
  it("/v1/cer/ai/certify without bundle shows AI surface", () => {
    const n = normalizeCertifiedRecord(makeEvent("/v1/cer/ai/certify"), null);
    expect(n.surface).toBe("ai");
    expect(n.endpointNote).not.toContain("PNG");
    expect(n.endpointNote).not.toContain("Renderer");
  });

  it("/v1/cer/ai/create without bundle shows AI surface", () => {
    const n = normalizeCertifiedRecord(makeEvent("/v1/cer/ai/create"), null);
    expect(n.surface).toBe("ai");
    expect(n.endpointNote).not.toContain("PNG");
  });

  it("/v1/cer/ai/certify with bundle shows full AI CER fields", () => {
    const bundle = {
      bundleType: "cer.ai.execution.v1",
      certificateHash: "sha256:abc123",
      createdAt: "2025-01-01T00:00:00Z",
      version: "0.1",
      snapshot: {
        executionId: "exec-1",
        inputHash: "sha256:input",
        outputHash: "sha256:output",
        protocolVersion: "1.2.0",
        sdkVersion: "0.7.0",
        input: "test",
        output: "result",
        prompt: "do something",
      },
      attestation: {
        attestationId: "att-1",
        receipt: "receipt-data",
        signatureB64Url: "sig-data",
      },
    };

    const n = normalizeCertifiedRecord(makeEvent("/v1/cer/ai/certify"), bundle);
    expect(n.surface).toBe("ai");
    expect(n.bundleType).toBe("cer.ai.execution.v1");
    expect(n.certificateHash).toBe("sha256:abc123");
    expect(n.inputHash).toBe("sha256:input");
    expect(n.outputHash).toBe("sha256:output");
    expect(n.attestationId).toBe("att-1");
    expect(n.completeness).toBe("full");
    expect(n.endpointNote).toBe("Attestation returns JSON (application/json).");
  });

  it("/api/render still classifies as code", () => {
    const n = normalizeCertifiedRecord(makeEvent("/api/render"), null);
    expect(n.surface).toBe("code");
    expect(n.endpointNote).toContain("Renderer returns PNG");
  });
});

// ── enrichEventWithCER for v1 AI endpoints ─────────────────────────

describe("enrichEventWithCER – v1 AI endpoints", () => {
  it("sets surface=ai for /v1/cer/ai/certify", () => {
    const enriched = enrichEventWithCER(makeEvent("/v1/cer/ai/certify"));
    expect(enriched.surface).toBe("ai");
    expect(enriched.normalized.surface).toBe("ai");
  });

  it("sets surface=code for /api/render", () => {
    const enriched = enrichEventWithCER(makeEvent("/api/render"));
    expect(enriched.surface).toBe("code");
  });
});
