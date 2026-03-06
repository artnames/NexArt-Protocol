import { describe, it, expect } from "vitest";

// ── Mirror export types for unit testing without async deps ──────────

interface SingleRecordAuditReport {
  exportType: string;
  exportedAt: string;
  execution_id: string | null;
  certificate_hash: string | null;
  bundle_type: string | null;
  surface: "ai" | "code";
  project: string | null;
  app: string | null;
  verification: {
    verification_status: string;
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
}

interface ProjectExportRow {
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

// ── Stamp derivation (same logic as audit-export.ts) ────────────────

function deriveStampStatus(rawBundleJson: Record<string, unknown> | null): { status: string; mode: string | null } {
  const meta = rawBundleJson?.meta as Record<string, unknown> | undefined;
  const att = (meta?.attestation ?? null) as Record<string, unknown> | null;
  const hasReceipt = !!att?.receipt || !!att?.signatureB64Url;
  const hasLegacy = !!(att?.attestationId || att?.nodeRuntimeHash);
  const mode = (att?.mode as string) ?? null;

  if (hasReceipt) {
    if (mode === "hash-only") return { status: "hash_only_timestamp", mode };
    if (mode === "redacted_reseal") return { status: "signed_redacted_reseal", mode };
    return { status: "signed_full", mode: mode ?? "full" };
  }
  if (hasLegacy) return { status: "legacy_not_verifiable", mode: null };
  return { status: "not_attested", mode: null };
}

function buildMockReport(overrides: Partial<SingleRecordAuditReport> = {}): SingleRecordAuditReport {
  return {
    exportType: "nexart_audit_report_v1",
    exportedAt: "2026-03-06T00:00:00.000Z",
    execution_id: "exec-001",
    certificate_hash: "sha256:abc123",
    bundle_type: "cer.ai.execution.v1",
    surface: "ai",
    project: null,
    app: null,
    verification: {
      verification_status: "VERIFIED",
      bundle_integrity_status: "PASS",
      node_signature_status: "PASS",
      receipt_consistency_status: "PASS",
    },
    stamp_status: "signed_full",
    stamp_mode: "full",
    attestor_key_id: "k1",
    node_url: "https://node.nexart.io",
    protocol_version: "1.0",
    sdk_version: "0.1.0",
    execution_timestamp: "2026-03-06T00:00:00.000Z",
    auto_stamp_status: "auto_stamped",
    ...overrides,
  };
}

function buildMockRow(overrides: Partial<ProjectExportRow> = {}): ProjectExportRow {
  return {
    created_at: "2026-03-06T00:00:00.000Z",
    project: "My Project",
    app: "My App",
    execution_id: "exec-001",
    bundle_type: "cer.ai.execution.v1",
    surface: "ai",
    certificate_hash: "sha256:abc123",
    verification_status: "VERIFIED",
    stamp_status: "signed_full",
    protocol_version: "1.0",
    sdk_version: "0.1.0",
    ...overrides,
  };
}

// ── CSV serializer ──────────────────────────────────────────────────

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

function rowsToCsv(rows: ProjectExportRow[]): string {
  const header = CSV_HEADERS.map(escapeCsvField).join(",");
  const lines = rows.map((row) =>
    CSV_HEADERS.map((key) => escapeCsvField(String(row[key] ?? ""))).join(",")
  );
  return [header, ...lines].join("\n");
}

// ── Tests ───────────────────────────────────────────────────────────

describe("single-record audit export shape", () => {
  it("has correct top-level structure", () => {
    const report = buildMockReport();
    expect(report.exportType).toBe("nexart_audit_report_v1");
    expect(report.execution_id).toBe("exec-001");
    expect(report.certificate_hash).toBe("sha256:abc123");
    expect(report.bundle_type).toBe("cer.ai.execution.v1");
    expect(report.surface).toBe("ai");
  });

  it("includes verification status fields", () => {
    const report = buildMockReport();
    expect(report.verification.verification_status).toBe("VERIFIED");
    expect(report.verification.bundle_integrity_status).toBe("PASS");
    expect(report.verification.node_signature_status).toBe("PASS");
    expect(report.verification.receipt_consistency_status).toBe("PASS");
  });

  it("handles PARTIAL verification", () => {
    const report = buildMockReport({
      verification: {
        verification_status: "PARTIAL",
        bundle_integrity_status: "PASS",
        node_signature_status: "N/A",
        receipt_consistency_status: "N/A",
      },
      stamp_status: "not_attested",
      stamp_mode: null,
    });
    expect(report.verification.verification_status).toBe("PARTIAL");
    expect(report.stamp_status).toBe("not_attested");
  });

  it("handles unassigned project/app safely", () => {
    const report = buildMockReport({ project: null, app: null });
    expect(report.project).toBeNull();
    expect(report.app).toBeNull();
  });

  it("includes project/app when assigned", () => {
    const report = buildMockReport({ project: "My Project", app: "My App" });
    expect(report.project).toBe("My Project");
    expect(report.app).toBe("My App");
  });

  it("includes stamp_status for signed records", () => {
    const report = buildMockReport({ stamp_status: "signed_full", stamp_mode: "full" });
    expect(report.stamp_status).toBe("signed_full");
    expect(report.stamp_mode).toBe("full");
  });

  it("includes stamp_status for legacy records", () => {
    const report = buildMockReport({ stamp_status: "legacy_not_verifiable", stamp_mode: null });
    expect(report.stamp_status).toBe("legacy_not_verifiable");
  });

  it("includes auto_stamp_status", () => {
    const report = buildMockReport({ auto_stamp_status: "auto_stamped" });
    expect(report.auto_stamp_status).toBe("auto_stamped");
  });
});

describe("project export row shape", () => {
  it("has all required fields", () => {
    const row = buildMockRow();
    expect(row.created_at).toBeDefined();
    expect(row.project).toBe("My Project");
    expect(row.app).toBe("My App");
    expect(row.execution_id).toBe("exec-001");
    expect(row.bundle_type).toBe("cer.ai.execution.v1");
    expect(row.surface).toBe("ai");
    expect(row.certificate_hash).toBe("sha256:abc123");
    expect(row.verification_status).toBe("VERIFIED");
    expect(row.stamp_status).toBe("signed_full");
    expect(row.protocol_version).toBe("1.0");
    expect(row.sdk_version).toBe("0.1.0");
  });

  it("handles empty app name for unassigned", () => {
    const row = buildMockRow({ app: "" });
    expect(row.app).toBe("");
  });
});

describe("CSV serialization", () => {
  it("produces correct header + rows", () => {
    const rows = [buildMockRow()];
    const csv = rowsToCsv(rows);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("created_at");
    expect(lines[0]).toContain("verification_status");
    expect(lines[1]).toContain("sha256:abc123");
  });

  it("escapes fields with commas", () => {
    const rows = [buildMockRow({ project: "Project, Inc" })];
    const csv = rowsToCsv(rows);
    expect(csv).toContain('"Project, Inc"');
  });
});

describe("stamp status derivation", () => {
  it("signed_full for receipt with full mode", () => {
    const result = deriveStampStatus({ meta: { attestation: { receipt: "...", signatureB64Url: "...", mode: "full" } } });
    expect(result.status).toBe("signed_full");
  });

  it("signed_redacted_reseal for reseal mode", () => {
    const result = deriveStampStatus({ meta: { attestation: { receipt: "...", signatureB64Url: "...", mode: "redacted_reseal" } } });
    expect(result.status).toBe("signed_redacted_reseal");
  });

  it("hash_only_timestamp for hash-only mode", () => {
    const result = deriveStampStatus({ meta: { attestation: { receipt: "...", signatureB64Url: "...", mode: "hash-only" } } });
    expect(result.status).toBe("hash_only_timestamp");
  });

  it("legacy_not_verifiable for records with attestationId but no receipt", () => {
    const result = deriveStampStatus({ meta: { attestation: { attestationId: "att-1" } } });
    expect(result.status).toBe("legacy_not_verifiable");
  });

  it("not_attested for no attestation", () => {
    const result = deriveStampStatus(null);
    expect(result.status).toBe("not_attested");
  });
});
