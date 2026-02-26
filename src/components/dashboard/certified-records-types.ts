import type { UsageEvent, StoredCERBundle } from "@/lib/api";
import { computeCertificateHash } from "@/lib/cer-hash";

// ── Normalized CER (single source of truth for the drawer) ──────────

export interface NormalizedCER {
  surface: "ai" | "code";
  bundleType: string | null;
  certificateHash: string | null;
  /** Original certificate hash from storage (before redaction recompute) */
  originalCertificateHash: string | null;
  protocolVersion: string | null;
  sdkVersion: string | null;
  timestamp: string | null;
  executionId: string | null;
  appId: string | null;
  inputHash: string | null;
  outputHash: string | null;
  attestationId: string | null;
  nodeRuntimeHash: string | null;
  upstreamStatus: number | null;
  durationMs: number | null;
  parameters: Record<string, unknown> | null;
  snapshotJson: Record<string, unknown> | null;
  rawBundleJson: Record<string, unknown> | null;
  /** "full" = all CER fields present, "partial" = some missing, "none" = no CER data */
  completeness: "full" | "partial" | "none";
  /** Whether the export is a redacted bundle with recomputed hash */
  isRedactedExport: boolean;
  /** Endpoint-specific message shown in drawer */
  endpointNote: string;
  /** Storage path for artifact (PNG for render bundles) */
  artifactPath: string | null;
  /** MIME type of stored artifact */
  artifactMime: string | null;
  /** Verification status computed by actual hash check */
  verificationStatus: "pending" | "pass" | "fail" | "unavailable";
  /** Verification failure reason if any */
  verificationReason: string | null;
}

// ── Raw CER bundle shape (from /api/attest JSON response) ───────────

export interface RawCERBundle {
  bundleType?: string;
  certificateHash?: string;
  createdAt?: string;
  snapshot?: {
    protocolVersion?: string;
    sdkVersion?: string;
    executionId?: string;
    appId?: string;
    timestamp?: string;
    inputHash?: string;
    outputHash?: string;
    parameters?: Record<string, unknown>;
  };
  attestation?: {
    attestationId?: string;
    hash?: string;
    nodeRuntimeHash?: string;
  };
}

// ── Extended usage event used across the UI ─────────────────────────

export interface CertifiedUsageEvent extends UsageEvent {
  surface: "ai" | "code";
  normalized: NormalizedCER;
}

// ── Normalization logic ─────────────────────────────────────────────

function deriveSurface(endpoint: string | undefined): "ai" | "code" {
  if (endpoint?.includes("attest")) return "ai";
  return "code";
}

/**
 * Normalize a raw usage event + optional CER bundle into a single
 * consistent shape for the drawer.  Never invents data — if a field
 * is absent, it stays null.
 */
export function normalizeCertifiedRecord(
  event: UsageEvent,
  bundle: RawCERBundle | null = null,
): NormalizedCER {
  const surface = deriveSurface(event.endpoint);
  const isSuccess = event.status_code >= 200 && event.status_code < 300;

  // /api/render returns PNG binary — no inline CER bundle
  // If a stored bundle exists, use it; otherwise show "none"
  if (surface === "code" && !bundle) {
    return {
      surface,
      bundleType: null,
      certificateHash: null,
      protocolVersion: null,
      sdkVersion: null,
      timestamp: event.created_at || null,
      executionId: String(event.id),
      appId: null,
      inputHash: null,
      outputHash: null,
      attestationId: null,
      nodeRuntimeHash: null,
      upstreamStatus: event.status_code,
      durationMs: event.duration_ms,
      parameters: null,
      snapshotJson: null,
      rawBundleJson: null,
      completeness: "none",
      endpointNote:
        "Renderer returns PNG (image/png). No stored record for this run.",
      artifactPath: null,
      artifactMime: null,
    };
  }

  // Code surface WITH a stored bundle
  if (surface === "code" && bundle) {
    const snap = bundle.snapshot ?? null;
    const att = bundle.attestation ?? null;
    const hasCore = !!bundle.certificateHash;

    return {
      surface,
      bundleType: bundle.bundleType ?? null,
      certificateHash: bundle.certificateHash ?? null,
      protocolVersion: snap?.protocolVersion ?? null,
      sdkVersion: snap?.sdkVersion ?? null,
      timestamp: snap?.timestamp ?? bundle.createdAt ?? event.created_at ?? null,
      executionId: snap?.executionId ?? String(event.id),
      appId: snap?.appId ?? null,
      inputHash: snap?.inputHash ?? null,
      outputHash: snap?.outputHash ?? null,
      attestationId: att?.attestationId ?? att?.hash ?? null,
      nodeRuntimeHash: att?.nodeRuntimeHash ?? null,
      upstreamStatus: event.status_code,
      durationMs: event.duration_ms,
      parameters: snap?.parameters ?? null,
      snapshotJson: snap ? { ...snap } : null,
      rawBundleJson: bundle ? { ...bundle } : null,
      completeness: hasCore ? "full" : "partial",
      endpointNote:
        "Renderer returns PNG. Stored record includes output hash and artifact path.",
      artifactPath: null,
      artifactMime: null,
    };
  }

  // /api/attest — AI surface
  if (!isSuccess || !bundle) {
    return {
      surface,
      bundleType: null,
      certificateHash: null,
      protocolVersion: null,
      sdkVersion: null,
      timestamp: event.created_at || null,
      executionId: String(event.id),
      appId: null,
      inputHash: null,
      outputHash: null,
      attestationId: null,
      nodeRuntimeHash: null,
      upstreamStatus: event.status_code,
      durationMs: event.duration_ms,
      parameters: null,
      snapshotJson: null,
      rawBundleJson: null,
      completeness: isSuccess ? "partial" : "none",
      endpointNote:
        isSuccess
          ? "Attestation returned success but no CER bundle was stored for this run."
          : "Attestation returned an error. No CER bundle available.",
      artifactPath: null,
      artifactMime: null,
    };
  }

  const snap = bundle.snapshot ?? null;
  const att = bundle.attestation ?? null;

  const hasCore =
    !!bundle.certificateHash && !!snap?.executionId && !!snap?.inputHash;

  return {
    surface,
    bundleType: bundle.bundleType ?? null,
    certificateHash: bundle.certificateHash ?? null,
    protocolVersion: snap?.protocolVersion ?? null,
    sdkVersion: snap?.sdkVersion ?? null,
    timestamp: snap?.timestamp ?? bundle.createdAt ?? event.created_at ?? null,
    executionId: snap?.executionId ?? null,
    appId: snap?.appId ?? null,
    inputHash: snap?.inputHash ?? null,
    outputHash: snap?.outputHash ?? null,
    attestationId: att?.attestationId ?? att?.hash ?? null,
    nodeRuntimeHash: att?.nodeRuntimeHash ?? null,
    upstreamStatus: event.status_code,
    durationMs: event.duration_ms,
    parameters: snap?.parameters ?? null,
    snapshotJson: snap ? { ...snap } : null,
    rawBundleJson: bundle ? { ...bundle } : null,
    completeness: hasCore ? "full" : "partial",
    endpointNote: "Attestation returns JSON (application/json).",
    artifactPath: null,
    artifactMime: null,
  };
}

// ── Enrich helper used by the table (no bundle data yet) ────────────

export function enrichEventWithCER(event: UsageEvent): CertifiedUsageEvent {
  const surface = deriveSurface(event.endpoint);
  const normalized = normalizeCertifiedRecord(event, null);
  return { ...event, surface, normalized };
}

// ── Enrich with stored bundle data ──────────────────────────────────

export function enrichEventWithStoredBundle(
  event: CertifiedUsageEvent,
  stored: StoredCERBundle,
): CertifiedUsageEvent {
  // Reconstruct a RawCERBundle from stored data
  const bundle: RawCERBundle = {
    bundleType: stored.bundleType ?? undefined,
    certificateHash: stored.certificateHash ?? undefined,
    createdAt: stored.storedAt,
    ...(stored.bundle as Record<string, unknown>),
  };

  // If stored.bundle has snapshot/attestation at top level, use them
  const rawBundle = stored.bundle as Record<string, unknown>;
  if (rawBundle.snapshot) {
    bundle.snapshot = rawBundle.snapshot as RawCERBundle["snapshot"];
  }
  if (stored.attestationJson) {
    bundle.attestation = stored.attestationJson as RawCERBundle["attestation"];
  } else if (rawBundle.attestation) {
    bundle.attestation = rawBundle.attestation as RawCERBundle["attestation"];
  }

  const normalized = normalizeCertifiedRecord(event, bundle);
  // Overlay artifact info from stored bundle
  normalized.artifactPath = stored.artifactPath ?? null;
  normalized.artifactMime = stored.artifactMime ?? null;
  // For render bundles with a stored bundle, update the endpoint note
  if (normalized.surface === "code" && normalized.completeness !== "none") {
    normalized.endpointNote = "Renderer returns PNG. Stored record includes output hash and artifact path.";
  }
  return { ...event, surface: normalized.surface, normalized };
}

// ── Summary stats ───────────────────────────────────────────────────

export function computeCertificationSummary(events: CertifiedUsageEvent[]) {
  const successful = events.filter(
    (e) => e.status_code >= 200 && e.status_code < 300,
  );
  const aiCount = successful.filter((e) => e.surface === "ai").length;
  const codeModeCount = successful.filter((e) => e.surface === "code").length;
  const total = successful.length;
  const attestedCount = events.filter(
    (e) => e.normalized.completeness === "full",
  ).length;
  const successRate =
    total > 0 ? Math.round((attestedCount / total) * 100) : 0;

  return { total, aiCount, codeModeCount, successRate };
}
