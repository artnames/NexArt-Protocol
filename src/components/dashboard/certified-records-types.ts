import type { UsageEvent } from "@/lib/api";

export interface CERSnapshot {
  inputHash?: string;
  outputHash?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    seed?: number | string;
    topP?: number;
    vars?: Record<string, unknown>;
  };
}

export interface CERAttestation {
  hash?: string;
  nodeRuntimeHash?: string;
}

export interface CertifiedExecutionRecord {
  certificateHash: string;
  executionId: string;
  bundleType: string;
  protocolVersion: string;
  sdkVersion?: string;
  appId?: string;
  snapshot?: CERSnapshot;
  attestation?: CERAttestation;
}

export interface CertifiedUsageEvent extends UsageEvent {
  surface: "ai" | "codemode";
  cer: CertifiedExecutionRecord | null;
}

/** Derive mock CER data from a raw UsageEvent for display purposes */
export function enrichEventWithCER(event: UsageEvent): CertifiedUsageEvent {
  const isSuccess = event.status_code >= 200 && event.status_code < 300;
  const isAI = event.endpoint?.includes("attest") || Math.random() > 0.5;
  const surface: "ai" | "codemode" = isAI ? "ai" : "codemode";

  if (!isSuccess) {
    return { ...event, surface, cer: null };
  }

  // Generate deterministic-looking mock hashes from event id
  const hash = (prefix: string) => {
    const chars = "0123456789abcdef";
    let h = "";
    for (let i = 0; i < 64; i++) {
      h += chars[(event.id.charCodeAt(i % event.id.length) + prefix.charCodeAt(i % prefix.length) + i) % 16];
    }
    return `sha256:${h}`;
  };

  return {
    ...event,
    surface,
    cer: {
      certificateHash: hash("cert"),
      executionId: crypto.randomUUID ? crypto.randomUUID() : event.id,
      bundleType: "standard",
      protocolVersion: "v1.2.0",
      sdkVersion: "1.8.4",
      appId: surface === "ai" ? "ai.execution.v1" : "codemode.render.v1",
      snapshot: {
        inputHash: hash("input"),
        outputHash: hash("output"),
        parameters: surface === "ai"
          ? { temperature: 0.7, maxTokens: 4096, seed: 42, topP: 0.95 }
          : { seed: 42, vars: { width: 1950, height: 2400 } },
      },
      attestation: {
        hash: hash("attest"),
        nodeRuntimeHash: hash("node"),
      },
    },
  };
}

export function computeCertificationSummary(events: CertifiedUsageEvent[]) {
  const certified = events.filter((e) => e.cer !== null);
  const aiCount = certified.filter((e) => e.surface === "ai").length;
  const codeModeCount = certified.filter((e) => e.surface === "codemode").length;
  const total = certified.length;
  const successRate = total > 0 ? 100 : 0;

  return { total, aiCount, codeModeCount, successRate };
}
