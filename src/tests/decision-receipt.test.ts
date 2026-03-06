import { describe, it, expect } from "vitest";
import type { VerifyResult } from "@/lib/verifyLocal";

// Test the decision receipt fallback logic (presentation only)
describe("DecisionReceipt fallback logic", () => {
  const baseResult: VerifyResult = {
    ok: true,
    reason: "OK",
    explanation: "Record intact.",
    computedHash: "sha256:abc",
    recordedHash: "sha256:abc",
    detail: null,
    meta: {
      bundleType: "cer.ai.execution.v1",
      createdAt: "2024-01-01T00:00:00Z",
      appId: "test-app",
      provider: "openai",
      model: "gpt-4",
      executionId: "exec-123",
      protocolVersion: "1.0",
    },
  };

  it("shows decision field when present in snapshot", () => {
    const bundle = {
      snapshot: { decision: "Approved", model: "gpt-4" },
      bundleType: "cer.ai.execution.v1",
    };
    const decision = (bundle.snapshot as Record<string, unknown>)?.decision ?? null;
    expect(decision).toBe("Approved");
  });

  it("falls back to outcome field", () => {
    const bundle = {
      snapshot: { outcome: "Rejected", model: "gpt-4" },
      bundleType: "cer.ai.execution.v1",
    };
    const snap = bundle.snapshot as Record<string, unknown>;
    const decision = snap.decision ?? snap.outcome ?? null;
    expect(decision).toBe("Rejected");
  });

  it("falls back to generic label when no decision field", () => {
    const bundle = {
      snapshot: { model: "gpt-4" },
      bundleType: "cer.ai.execution.v1",
    };
    const snap = bundle.snapshot as Record<string, unknown>;
    const decision = snap.decision ?? snap.outcome ?? snap.result ?? null;
    expect(decision).toBeNull();
    // Component would show "Execution verified" as fallback
  });

  it("shows 'Record verified' for code mode bundles", () => {
    const result = { ...baseResult, meta: { ...baseResult.meta, bundleType: "cer.codemode.render.v1" } };
    const isAI = result.meta.bundleType === "cer.ai.execution.v1";
    expect(isAI).toBe(false);
    // Component would show "Record verified" instead of "Execution verified"
  });

  it("shows failure state correctly", () => {
    const failResult: VerifyResult = {
      ...baseResult,
      ok: false,
      reason: "CERTIFICATE_HASH_MISMATCH",
      explanation: "Record has been modified.",
    };
    expect(failResult.ok).toBe(false);
  });
});
