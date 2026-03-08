/**
 * Full audit package builder.
 *
 * Generates a ZIP containing:
 * - cer.json             — the CER bundle as stored
 * - receipt.json          — node receipt + signature fields
 * - verification-report.json — integrity & signature verification results
 * - node-metadata.json    — fetched from /.well-known/nexart-node.json
 * - evidence-summary.html — human-readable summary (printable to PDF)
 * - README.txt            — independent verification instructions
 */

import JSZip from "jszip";
import type { NormalizedCER } from "@/components/dashboard/certified-records-types";
import { computeVerificationReport, type VerificationReportData } from "@/components/dashboard/VerificationReport";
import { getVerificationUrl } from "@/lib/verification-url";
import { getStampFields } from "@/lib/verifyLocal";

// ── Helpers ─────────────────────────────────────────────────────────

function safeFilenameId(n: NormalizedCER): string {
  return (n.executionId ?? n.certificateHash ?? "unknown")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 60);
}

async function fetchNodeMetadata(nodeUrl: string): Promise<Record<string, unknown> | null> {
  try {
    const resp = await fetch(`${nodeUrl}/.well-known/nexart-node.json`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

// ── Receipt extraction ──────────────────────────────────────────────

function extractReceipt(bundle: Record<string, unknown>): Record<string, unknown> | null {
  const { attestation } = getStampFields(bundle);
  if (!attestation) return null;

  const out: Record<string, unknown> = {};
  if (attestation.receipt) out.receipt = attestation.receipt;
  if (attestation.signatureB64Url) out.signatureB64Url = attestation.signatureB64Url;
  if (attestation.attestorKeyId) out.attestorKeyId = attestation.attestorKeyId;
  if (attestation.mode) out.mode = attestation.mode;
  if (attestation.nodeUrl) out.nodeUrl = attestation.nodeUrl;
  if (attestation.attestedAt) out.attestedAt = attestation.attestedAt;
  if (attestation.nodeRuntimeHash) out.nodeRuntimeHash = attestation.nodeRuntimeHash;
  if (attestation.attestationId) out.attestationId = attestation.attestationId;

  return Object.keys(out).length > 0 ? out : null;
}

// ── Verification report JSON ────────────────────────────────────────

function reportToJson(report: VerificationReportData): Record<string, unknown> {
  return {
    exportType: "nexart_verification_report_v1",
    exportedAt: new Date().toISOString(),
    verdict: report.verdict,
    partialReason: report.partialReason ?? null,
    checks: report.checks.map(c => ({
      label: c.label,
      status: c.status,
      detail: c.detail ?? null,
    })),
    certificateHash: report.certificateHash,
    attestorKeyId: report.attestorKeyId,
    protocolVersion: report.protocolVersion,
    sdkVersion: report.sdkVersion,
    executionTimestamp: report.executionTimestamp,
    nodeUrl: report.nodeUrl,
  };
}

// ── Evidence summary (HTML) ─────────────────────────────────────────

function buildEvidenceSummaryHtml(
  n: NormalizedCER,
  report: VerificationReportData,
  projectName: string | null,
  appName: string | null,
): string {
  const verificationUrl = getVerificationUrl({
    executionId: n.executionId,
    certificateHash: n.certificateHash,
  });

  const snap = n.rawBundleJson?.snapshot as Record<string, unknown> | undefined;

  const rows: [string, string | null][] = [
    ["Execution ID", n.executionId],
    ["Certificate Hash", n.certificateHash],
    ["Bundle Type", n.bundleType],
    ["Protocol Version", n.protocolVersion],
    ["SDK Version", n.sdkVersion],
    ["Provider", (snap?.provider as string) ?? null],
    ["Model", (snap?.model as string) ?? null],
    ["Timestamp", n.timestamp],
    ["Project", projectName],
    ["App", appName],
    ["Input Hash", n.inputHash],
    ["Output Hash", n.outputHash],
    ["Verification Result", report.verdict],
    ["Verification URL", verificationUrl],
  ];

  const checksHtml = report.checks.map(c => {
    const color = c.status === "PASS" ? "#16a34a" : c.status === "FAIL" ? "#dc2626" : "#888";
    return `<tr><td style="padding:4px 12px 4px 0;font-size:13px">${c.label}</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:${color}">${c.status}</td></tr>`;
  }).join("\n");

  const fieldRows = rows.map(([label, value]) => {
    const display = value
      ? (label === "Verification URL" ? `<a href="${value}">${value}</a>` : escapeHtml(value))
      : "—";
    return `<tr><td style="padding:4px 12px 4px 0;font-size:13px;color:#666;white-space:nowrap">${label}</td><td style="padding:4px 0;font-size:13px;font-family:monospace;word-break:break-all">${display}</td></tr>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CER Evidence Summary — ${n.executionId ?? n.certificateHash ?? "unknown"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    h2 { font-size: 14px; margin-top: 32px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    table { border-collapse: collapse; width: 100%; }
    .meta { font-size: 12px; color: #888; margin-bottom: 24px; }
    .verdict { font-size: 16px; font-weight: 700; margin: 12px 0; }
    .verdict.VERIFIED { color: #16a34a; }
    .verdict.PARTIAL { color: #ca8a04; }
    .verdict.INVALID { color: #dc2626; }
    .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Certified Execution Record — Evidence Summary</h1>
  <p class="meta">Exported ${new Date().toISOString()} · NexArt Protocol</p>

  <h2>Verification Result</h2>
  <p class="verdict ${report.verdict}">${report.verdict}</p>
  <table>${checksHtml}</table>

  <h2>Record Details</h2>
  <table>${fieldRows}</table>

  <div class="footer">
    <p>This document is a human-readable summary of a Certified Execution Record (CER). It does not replace the machine-verifiable JSON artifacts included in this audit package.</p>
    <p>To independently verify this record, use the NexArt SDK or visit the verification URL above.</p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── README ──────────────────────────────────────────────────────────

function buildReadme(n: NormalizedCER): string {
  const verificationUrl = getVerificationUrl({
    executionId: n.executionId,
    certificateHash: n.certificateHash,
  });

  return `NexArt CER Audit Package
========================

This package contains the artifacts required to independently verify
a Certified Execution Record (CER) issued by NexArt.

Contents
--------
  cer.json                  — The CER bundle exactly as stored
  receipt.json              — Node receipt and signature fields (if attested)
  verification-report.json  — Automated integrity and signature verification results
  node-metadata.json        — Node public keys and metadata (if fetchable)
  evidence-summary.html     — Human-readable summary (open in browser or print to PDF)
  README.txt                — This file

How to Verify Independently
----------------------------

Option 1: Online verification
  ${verificationUrl ?? "No verification URL available for this record."}

Option 2: Using the NexArt SDK (@nexart/ai-execution)
  import { verifyBundle } from '@nexart/ai-execution';
  const bundle = JSON.parse(fs.readFileSync('cer.json', 'utf-8'));
  const result = verifyBundle(bundle);
  console.log(result.ok ? 'PASS' : 'FAIL', result.reason);

Option 3: Manual hash verification
  1. Parse cer.json
  2. Extract { bundleType, version, createdAt, snapshot } (exclude meta)
  3. Canonicalize using RFC 8785 (JCS)
  4. Compute SHA-256 of the canonical JSON
  5. Compare with certificateHash field (format: sha256:<hex>)

Notes
-----
- Verification confirms record integrity. It does not re-run models
  or validate output correctness.
- If this is a redacted export, the certificateHash corresponds to the
  redacted payload. The original hash is in meta.provenance.originalCertificateHash.
- Node signature verification requires the node's public key, available
  in node-metadata.json or at <nodeUrl>/.well-known/nexart-node.json.

Generated by NexArt · ${new Date().toISOString()}
`;
}

// ── Main export function ────────────────────────────────────────────

export interface AuditPackageOptions {
  normalized: NormalizedCER;
  projectName: string | null;
  appName: string | null;
}

export async function buildAuditPackageZip(opts: AuditPackageOptions): Promise<Blob> {
  const { normalized: n, projectName, appName } = opts;
  const bundle = n.rawBundleJson as Record<string, unknown>;
  if (!bundle) throw new Error("No CER bundle available for this record.");

  const zip = new JSZip();

  // 1. cer.json — bundle as stored
  zip.file("cer.json", JSON.stringify(bundle, null, 2));

  // 2. receipt.json
  const receipt = extractReceipt(bundle);
  zip.file("receipt.json", JSON.stringify(
    receipt ?? { note: "No attestation receipt available for this record." },
    null, 2,
  ));

  // 3. verification-report.json
  const report = await computeVerificationReport(n);
  zip.file("verification-report.json", JSON.stringify(reportToJson(report), null, 2));

  // 4. node-metadata.json
  const { attestation } = getStampFields(bundle);
  const nodeUrl = (attestation?.nodeUrl as string) ?? "https://node.nexart.io";
  const nodeMeta = await fetchNodeMetadata(nodeUrl);
  zip.file("node-metadata.json", JSON.stringify(
    nodeMeta ?? { note: "Node metadata could not be fetched.", nodeUrl },
    null, 2,
  ));

  // 5. evidence-summary.html
  zip.file("evidence-summary.html", buildEvidenceSummaryHtml(n, report, projectName, appName));

  // 6. README.txt
  zip.file("README.txt", buildReadme(n));

  return zip.generateAsync({ type: "blob" });
}
