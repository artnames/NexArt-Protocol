/**
 * Audit export utilities for CER records.
 *
 * Produces structured audit summaries (not raw bundles) for:
 * - Single-record JSON audit reports
 * - Project-level CSV/JSON exports
 */

import type { NormalizedCER, CertifiedUsageEvent } from "@/components/dashboard/certified-records-types";
import { computeVerificationReport, type OverallVerdict, type VerificationReportData } from "@/components/dashboard/VerificationReport";
import { getVerificationUrl } from "@/lib/verification-url";

// ── Types ────────────────────────────────────────────────────────────

export interface SingleRecordAuditReport {
  exportType: "nexart_audit_report_v1";
  exportedAt: string;
  execution_id: string | null;
  certificate_hash: string | null;
  bundle_type: string | null;
  surface: "ai" | "code";
  project: string | null;
  app: string | null;
  verification: {
    verification_status: OverallVerdict;
    bundle_integrity_status: string;
    node_signature_status: string;
    receipt_consistency_status: string;
  };
  stamp_status: string;
  stamp_mode: string | null;
  attestor_key_id: string | null;
  node_url: string | null;
  protocol_version: string | null;
  sdk_version: string | null;
  execution_timestamp: string | null;
  auto_stamp_status: string | null;
  verification_url: string | null;
}

export interface ProjectExportRow {
  created_at: string;
  project: string;
  app: string;
  execution_id: string;
  bundle_type: string;
  surface: string;
  certificate_hash: string;
  verification_status: string;
  stamp_status: string;
  protocol_version: string;
  sdk_version: string;
}

// ── Stamp status derivation (mirrors CERDetailDrawer logic) ─────────

function deriveStampStatusFromNormalized(n: NormalizedCER): { status: string; mode: string | null } {
  const meta = n.rawBundleJson?.meta as Record<string, unknown> | undefined;
  const att = (meta?.attestation ?? null) as Record<string, unknown> | null;
  const hasReceipt = !!att?.receipt || !!att?.signatureB64Url;
  const hasLegacy = !!(n.attestationId || n.nodeRuntimeHash || att?.attestationId || att?.nodeRuntimeHash);
  const mode = (att?.mode as string) ?? null;

  if (hasReceipt) {
    if (mode === "hash-only") return { status: "hash_only_timestamp", mode };
    if (mode === "redacted_reseal") return { status: "signed_redacted_reseal", mode };
    return { status: "signed_full", mode: mode ?? "full" };
  }
  if (hasLegacy) return { status: "legacy_not_verifiable", mode: null };
  return { status: "not_attested", mode: null };
}

function deriveAutoStampStatus(n: NormalizedCER): string | null {
  const meta = n.rawBundleJson?.meta as Record<string, unknown> | undefined;
  const att = (meta?.attestation ?? null) as Record<string, unknown> | null;
  if (!att) return null;
  if (att.autoStamped === true) return "auto_stamped";
  return null;
}

// ── Check status helper ─────────────────────────────────────────────

function checkStatus(checks: VerificationReportData["checks"], label: string): string {
  const c = checks.find((ch) => ch.label === label);
  return c?.status ?? "N/A";
}

// ── Single-record audit report ──────────────────────────────────────

export async function buildSingleRecordAuditReport(
  n: NormalizedCER,
  projectName: string | null,
  appName: string | null,
): Promise<SingleRecordAuditReport> {
  const report = await computeVerificationReport(n);
  const { status, mode } = deriveStampStatusFromNormalized(n);

  return {
    exportType: "nexart_audit_report_v1",
    exportedAt: new Date().toISOString(),
    execution_id: n.executionId,
    certificate_hash: n.certificateHash,
    bundle_type: n.bundleType,
    surface: n.surface,
    project: projectName ?? null,
    app: appName ?? null,
    verification: {
      verification_status: report.verdict,
      bundle_integrity_status: checkStatus(report.checks, "Bundle Integrity"),
      node_signature_status: checkStatus(report.checks, "Node Signature"),
      receipt_consistency_status: checkStatus(report.checks, "Receipt Consistency"),
    },
    stamp_status: status,
    stamp_mode: mode,
    attestor_key_id: report.attestorKeyId,
    node_url: report.nodeUrl,
    protocol_version: n.protocolVersion,
    sdk_version: n.sdkVersion,
    execution_timestamp: n.timestamp,
    auto_stamp_status: deriveAutoStampStatus(n),
    verification_url: getVerificationUrl({
      executionId: n.executionId,
      certificateHash: n.certificateHash,
    }),
  };
}

// ── Project-level export ────────────────────────────────────────────

export function buildProjectExportRow(
  event: CertifiedUsageEvent,
  projectName: string,
  appName: string,
  verificationStatus: string,
): ProjectExportRow {
  const n = event.normalized;
  const { status } = deriveStampStatusFromNormalized(n);

  return {
    created_at: event.created_at,
    project: projectName,
    app: appName,
    execution_id: n.executionId ?? String(event.id),
    bundle_type: n.bundleType ?? "",
    surface: n.surface,
    certificate_hash: n.certificateHash ?? "",
    verification_status: verificationStatus,
    stamp_status: status,
    protocol_version: n.protocolVersion ?? "",
    sdk_version: n.sdkVersion ?? "",
  };
}

// ── CSV serialization ───────────────────────────────────────────────

const CSV_HEADERS: (keyof ProjectExportRow)[] = [
  "created_at", "project", "app", "execution_id", "bundle_type",
  "surface", "certificate_hash", "verification_status", "stamp_status",
  "protocol_version", "sdk_version",
];

function escapeCsvField(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function rowsToCsv(rows: ProjectExportRow[]): string {
  const header = CSV_HEADERS.map(escapeCsvField).join(",");
  const lines = rows.map((row) =>
    CSV_HEADERS.map((key) => escapeCsvField(String(row[key] ?? ""))).join(",")
  );
  return [header, ...lines].join("\n");
}

// ── File download helpers ───────────────────────────────────────────

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
