/**
 * Browser-compatible implementation of @nexart/ai-execution core functions.
 * Uses Web Crypto API (SubtleCrypto) instead of Node.js crypto module.
 * Re-exports toCanonicalJson from the package (no crypto dependency).
 */

import type {
  AiExecutionSnapshotV1,
  AiExecutionParameters,
  CerAiExecutionBundle,
  CerMeta,
  VerificationResult,
  CreateSnapshotParams,
} from "@nexart/ai-execution";

// Re-implement canonical JSON (same logic as package, avoids import chain that pulls crypto)
function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Non-finite number not allowed in canonical JSON: ${value}`);
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

export function toCanonicalJson(value: unknown): string {
  return canonicalize(value);
}

// Async SHA-256 using Web Crypto API
async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashUtf8(value: string): Promise<string> {
  return `sha256:${await sha256Hex(value)}`;
}

async function hashCanonicalJson(value: unknown): Promise<string> {
  const canonical = toCanonicalJson(value);
  return `sha256:${await sha256Hex(canonical)}`;
}

async function computeInputHash(input: string | Record<string, unknown>): Promise<string> {
  return typeof input === "string" ? hashUtf8(input) : hashCanonicalJson(input);
}

async function computeOutputHash(output: string | Record<string, unknown>): Promise<string> {
  return typeof output === "string" ? hashUtf8(output) : hashCanonicalJson(output);
}

const PACKAGE_VERSION = "0.1.0";

function validateParameters(params: AiExecutionParameters): string[] {
  const errors: string[] = [];
  if (typeof params.temperature !== "number" || !Number.isFinite(params.temperature))
    errors.push(`parameters.temperature must be a finite number, got: ${params.temperature}`);
  if (typeof params.maxTokens !== "number" || !Number.isFinite(params.maxTokens))
    errors.push(`parameters.maxTokens must be a finite number, got: ${params.maxTokens}`);
  if (params.topP !== null && (typeof params.topP !== "number" || !Number.isFinite(params.topP)))
    errors.push(`parameters.topP must be a finite number or null, got: ${params.topP}`);
  if (params.seed !== null && (typeof params.seed !== "number" || !Number.isFinite(params.seed)))
    errors.push(`parameters.seed must be a finite number or null, got: ${params.seed}`);
  return errors;
}

export async function createSnapshot(params: CreateSnapshotParams): Promise<AiExecutionSnapshotV1> {
  const paramErrors = validateParameters(params.parameters);
  if (paramErrors.length > 0) throw new Error(`Invalid parameters: ${paramErrors.join("; ")}`);

  const [inputHash, outputHash] = await Promise.all([
    computeInputHash(params.input),
    computeOutputHash(params.output),
  ]);

  return {
    type: "ai.execution.v1",
    protocolVersion: "1.2.0",
    executionSurface: "ai",
    executionId: params.executionId,
    timestamp: params.timestamp ?? new Date().toISOString(),
    provider: params.provider,
    model: params.model,
    modelVersion: params.modelVersion ?? null,
    prompt: params.prompt,
    input: params.input,
    inputHash,
    parameters: {
      temperature: params.parameters.temperature,
      maxTokens: params.parameters.maxTokens,
      topP: params.parameters.topP ?? null,
      seed: params.parameters.seed ?? null,
    },
    output: params.output,
    outputHash,
    sdkVersion: params.sdkVersion ?? PACKAGE_VERSION,
    appId: params.appId ?? null,
  };
}

export async function verifySnapshot(snapshot: AiExecutionSnapshotV1): Promise<VerificationResult> {
  const errors: string[] = [];
  if (snapshot.type !== "ai.execution.v1") errors.push(`Expected type "ai.execution.v1", got "${snapshot.type}"`);
  if (snapshot.protocolVersion !== "1.2.0") errors.push(`Expected protocolVersion "1.2.0", got "${snapshot.protocolVersion}"`);
  if (snapshot.executionSurface !== "ai") errors.push(`Expected executionSurface "ai", got "${snapshot.executionSurface}"`);
  if (!snapshot.executionId || typeof snapshot.executionId !== "string") errors.push("executionId must be a non-empty string");
  if (!snapshot.timestamp || typeof snapshot.timestamp !== "string") errors.push("timestamp must be a non-empty string");
  if (!snapshot.provider || typeof snapshot.provider !== "string") errors.push("provider must be a non-empty string");
  if (!snapshot.model || typeof snapshot.model !== "string") errors.push("model must be a non-empty string");
  if (!snapshot.prompt || typeof snapshot.prompt !== "string") errors.push("prompt must be a non-empty string");
  if (snapshot.input === undefined || snapshot.input === null) errors.push("input must be a string or object");
  if (snapshot.output === undefined || snapshot.output === null) errors.push("output must be a string or object");
  errors.push(...validateParameters(snapshot.parameters));

  if (!snapshot.inputHash || !snapshot.inputHash.startsWith("sha256:")) errors.push(`inputHash must start with "sha256:", got "${snapshot.inputHash}"`);
  if (!snapshot.outputHash || !snapshot.outputHash.startsWith("sha256:")) errors.push(`outputHash must start with "sha256:", got "${snapshot.outputHash}"`);

  const [expectedInputHash, expectedOutputHash] = await Promise.all([
    computeInputHash(snapshot.input),
    computeOutputHash(snapshot.output),
  ]);

  if (snapshot.inputHash !== expectedInputHash) errors.push(`inputHash mismatch: expected ${expectedInputHash}, got ${snapshot.inputHash}`);
  if (snapshot.outputHash !== expectedOutputHash) errors.push(`outputHash mismatch: expected ${expectedOutputHash}, got ${snapshot.outputHash}`);

  return { ok: errors.length === 0, errors };
}

async function computeCertificateHash(payload: Record<string, unknown>): Promise<string> {
  const canonical = toCanonicalJson(payload);
  return `sha256:${await sha256Hex(canonical)}`;
}

export async function sealCer(
  snapshot: AiExecutionSnapshotV1,
  options?: { createdAt?: string; meta?: CerMeta }
): Promise<CerAiExecutionBundle> {
  const createdAt = options?.createdAt ?? new Date().toISOString();
  const payload = {
    bundleType: "cer.ai.execution.v1" as const,
    createdAt,
    snapshot,
    version: "0.1" as const,
  };
  const certificateHash = await computeCertificateHash(payload);
  const bundle: CerAiExecutionBundle = {
    bundleType: "cer.ai.execution.v1",
    certificateHash,
    createdAt,
    version: "0.1",
    snapshot,
  };
  if (options?.meta) bundle.meta = options.meta;
  return bundle;
}

export async function verifyCer(bundle: CerAiExecutionBundle): Promise<VerificationResult> {
  const errors: string[] = [];
  if (bundle.bundleType !== "cer.ai.execution.v1") errors.push(`Expected bundleType "cer.ai.execution.v1", got "${bundle.bundleType}"`);
  if (bundle.version !== "0.1") errors.push(`Expected version "0.1", got "${bundle.version}"`);
  if (!bundle.createdAt || typeof bundle.createdAt !== "string") errors.push("createdAt must be a non-empty string");
  if (!bundle.certificateHash || !bundle.certificateHash.startsWith("sha256:")) errors.push(`certificateHash must start with "sha256:", got "${bundle.certificateHash}"`);

  if (!bundle.snapshot) {
    errors.push("snapshot is required");
    return { ok: false, errors };
  }

  const snapshotResult = await verifySnapshot(bundle.snapshot);
  errors.push(...snapshotResult.errors);

  const payload = {
    bundleType: "cer.ai.execution.v1" as const,
    createdAt: bundle.createdAt,
    snapshot: bundle.snapshot,
    version: "0.1" as const,
  };
  const expectedHash = await computeCertificateHash(payload);
  if (bundle.certificateHash !== expectedHash) errors.push(`certificateHash mismatch: expected ${expectedHash}, got ${bundle.certificateHash}`);

  return { ok: errors.length === 0, errors };
}
