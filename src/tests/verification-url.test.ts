import { describe, it, expect } from "vitest";
import { getVerificationUrl, getVerificationPath } from "@/lib/verification-url";

describe("getVerificationUrl", () => {
  it("prefers executionId when both are provided", () => {
    const url = getVerificationUrl({
      executionId: "exec-123",
      certificateHash: "sha256:abc",
    });
    expect(url).toBe("https://verify.nexart.io/e/exec-123");
  });

  it("falls back to certificateHash when no executionId", () => {
    const url = getVerificationUrl({
      executionId: null,
      certificateHash: "sha256:abc",
    });
    expect(url).toBe("https://verify.nexart.io/c/sha256%3Aabc");
  });

  it("returns null when neither is available", () => {
    expect(getVerificationUrl({ executionId: null, certificateHash: null })).toBeNull();
  });

  it("encodes special characters in executionId", () => {
    const url = getVerificationUrl({ executionId: "exec/with spaces" });
    expect(url).toBe("https://verify.nexart.io/e/exec%2Fwith%20spaces");
  });
});

describe("getVerificationPath", () => {
  it("returns /e/ path for executionId", () => {
    expect(getVerificationPath({ executionId: "abc" })).toBe("/e/abc");
  });

  it("returns /c/ path for certificateHash", () => {
    expect(getVerificationPath({ certificateHash: "sha256:xyz" })).toBe("/c/sha256%3Axyz");
  });

  it("returns null when empty", () => {
    expect(getVerificationPath({})).toBeNull();
  });
});
