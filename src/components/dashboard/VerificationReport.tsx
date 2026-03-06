import { useState, useEffect } from "react";
import {
  ShieldCheck, ShieldAlert, ShieldQuestion, Copy, ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { computeCertificateHash } from "@/lib/cer-hash";
import { verifyStamp, getStampFields } from "@/lib/verifyLocal";
import type { NormalizedCER } from "./certified-records-types";

// ── Types ───────────────────────────────────────────────────────────

export type OverallVerdict = "VERIFIED" | "PARTIAL" | "INVALID" | "PENDING" | "UNAVAILABLE";

interface CheckResult {
  label: string;
  status: "PASS" | "FAIL" | "PENDING" | "N/A";
  detail?: string;
}

export interface SignatureDebugInfo {
  receiptType: string;
  receiptPreview: string;
  signaturePreview: string;
  kidUsed: string;
  nodeUrlUsed: string;
  keyFormat: string;
}

export interface VerificationReportData {
  verdict: OverallVerdict;
  partialReason?: string;
  checks: CheckResult[];
  certificateHash: string | null;
  attestorKeyId: string | null;
  protocolVersion: string | null;
  sdkVersion: string | null;
  executionTimestamp: string | null;
  nodeUrl: string | null;
  signatureDebug: SignatureDebugInfo | null;
}

// ── Compute report ──────────────────────────────────────────────────

export async function computeVerificationReport(
  n: NormalizedCER,
  nodeUrl?: string,
): Promise<VerificationReportData> {
  const bundle = n.rawBundleJson as Record<string, unknown> | null;

  // Extract attestation using the same path as the drawer (meta.attestation first)
  const { isSigned, attestation } = getStampFields(bundle ?? {});

  // Resolve nodeUrl: explicit prop > attestation metadata > undefined (let verifyStamp skip)
  const resolvedNodeUrl =
    nodeUrl ??
    (attestation?.nodeUrl as string | undefined) ??
    undefined;

  const base: Omit<VerificationReportData, "verdict" | "checks" | "partialReason"> = {
    certificateHash: n.certificateHash,
    attestorKeyId: (attestation?.attestorKeyId as string) ?? null,
    protocolVersion: n.protocolVersion,
    sdkVersion: n.sdkVersion,
    executionTimestamp: n.timestamp,
    nodeUrl: resolvedNodeUrl ?? null,
    signatureDebug: null,
  };

  if (!bundle) {
    return { ...base, verdict: "UNAVAILABLE", checks: [] };
  }

  const checks: CheckResult[] = [];

  // 1) Bundle Integrity — recompute certificateHash
  let integrityPass = false;
  const recordedHash = bundle.certificateHash as string | undefined;
  if (!recordedHash) {
    checks.push({ label: "Bundle Integrity", status: "FAIL", detail: "No certificateHash in bundle" });
  } else {
    try {
      const computed = await computeCertificateHash({
        bundleType: bundle.bundleType,
        version: bundle.version,
        createdAt: bundle.createdAt,
        snapshot: bundle.snapshot,
      });
      if (computed === recordedHash) {
        integrityPass = true;
        checks.push({ label: "Bundle Integrity", status: "PASS", detail: `Hash matches: ${recordedHash}` });
      } else {
        checks.push({ label: "Bundle Integrity", status: "FAIL", detail: `Computed ${computed} ≠ recorded ${recordedHash}` });
      }
    } catch (err) {
      checks.push({ label: "Bundle Integrity", status: "FAIL", detail: (err as Error).message });
    }
  }

  // 2) Node Signature
  let signaturePass = false;

  if (isSigned && attestation) {
    if (!resolvedNodeUrl) {
      checks.push({
        label: "Node Signature",
        status: "FAIL",
        detail: "Node URL unavailable for offline signature verification",
      });
    } else {
      const stampResult = await verifyStamp(bundle, resolvedNodeUrl);
      if (stampResult.debug) {
        base.signatureDebug = stampResult.debug;
      }
      if (stampResult.ok) {
        signaturePass = true;
        checks.push({ label: "Node Signature", status: "PASS", detail: stampResult.detail ?? "Ed25519 signature verified" });
      } else {
        checks.push({ label: "Node Signature", status: "FAIL", detail: stampResult.detail ?? stampResult.explanation });
      }
    }
  } else {
    checks.push({ label: "Node Signature", status: "N/A", detail: "No signed receipt present" });
  }

  // 3) Receipt Consistency — receipt.certificateHash vs bundle.certificateHash
  if (isSigned && attestation?.receipt) {
    try {
      // Receipt may be a JSON string or already an object
      const receiptRaw = attestation.receipt;
      const receiptObj: Record<string, unknown> =
        typeof receiptRaw === "string"
          ? JSON.parse(receiptRaw)
          : (receiptRaw as Record<string, unknown>);

      const receiptCertHash = receiptObj.certificateHash as string | undefined;
      // Compare against the current bundle hash (which is the redacted/signed hash for reseal records)
      if (receiptCertHash && recordedHash) {
        if (receiptCertHash === recordedHash) {
          checks.push({ label: "Receipt Consistency", status: "PASS", detail: "Receipt certificateHash matches bundle" });
        } else {
          checks.push({ label: "Receipt Consistency", status: "FAIL", detail: `Receipt hash ${receiptCertHash} ≠ bundle hash ${recordedHash}` });
        }
      } else {
        checks.push({ label: "Receipt Consistency", status: "N/A", detail: "Receipt missing certificateHash field" });
      }
    } catch {
      checks.push({ label: "Receipt Consistency", status: "N/A", detail: "Receipt is not parseable JSON" });
    }
  } else {
    checks.push({ label: "Receipt Consistency", status: "N/A", detail: "No receipt present" });
  }

  // Derive verdict
  let verdict: OverallVerdict;
  let partialReason: string | undefined;
  if (!integrityPass) {
    verdict = "INVALID";
  } else if (integrityPass && signaturePass) {
    verdict = "VERIFIED";
  } else if (isSigned && !resolvedNodeUrl) {
    // Signed receipt exists but we can't verify the key
    verdict = "PARTIAL";
    partialReason = "Signed receipt present, but node key lookup unavailable.";
  } else if (isSigned) {
    verdict = "PARTIAL";
    partialReason = "Signed receipt present but signature verification failed.";
  } else {
    verdict = "PARTIAL";
  }

  return { ...base, verdict, partialReason, checks };
}

// ── Component ───────────────────────────────────────────────────────

function copyText(text: string, label: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: `${label} copied to clipboard.` });
}

function VerdictBanner({ verdict, partialReason }: { verdict: OverallVerdict; partialReason?: string }) {
  switch (verdict) {
    case "VERIFIED":
      return (
        <div className="flex items-center gap-2 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-mono text-sm font-semibold text-green-600">VERIFIED</p>
            <p className="text-xs text-muted-foreground">Bundle integrity and node signature both pass.</p>
          </div>
        </div>
      );
    case "PARTIAL":
      return (
        <div className="flex items-center gap-2 rounded-md border border-yellow-600/30 bg-yellow-600/10 px-4 py-3">
          <ShieldQuestion className="h-5 w-5 text-yellow-600 shrink-0" />
          <div>
            <p className="font-mono text-sm font-semibold text-yellow-600">PARTIAL</p>
            <p className="text-xs text-muted-foreground">{partialReason ?? "Bundle integrity passes but no signed receipt for offline verification."}</p>
          </div>
        </div>
      );
    case "INVALID":
      return (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="font-mono text-sm font-semibold text-destructive">INVALID</p>
            <p className="text-xs text-muted-foreground">Bundle integrity check failed. This record may have been modified.</p>
          </div>
        </div>
      );
    case "PENDING":
      return (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-4 py-3 animate-pulse">
          <ShieldQuestion className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="font-mono text-sm text-muted-foreground">Verifying…</p>
        </div>
      );
    default:
      return null;
  }
}

function CheckRow({ check }: { check: CheckResult }) {
  const color =
    check.status === "PASS" ? "text-green-600"
    : check.status === "FAIL" ? "text-destructive"
    : "text-muted-foreground";

  return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <span className="text-xs text-muted-foreground shrink-0">{check.label}</span>
      <div className="text-right min-w-0">
        <span className={`font-mono text-xs font-semibold ${color}`}>{check.status}</span>
        {check.detail && (
          <p className="text-[10px] font-mono text-muted-foreground/70 break-all">{check.detail}</p>
        )}
      </div>
    </div>
  );
}

interface VerificationReportProps {
  normalized: NormalizedCER;
  isLegacy: boolean;
  nodeUrl?: string;
}

export default function VerificationReport({ normalized, isLegacy, nodeUrl }: VerificationReportProps) {
  const { toast } = useToast();
  const [report, setReport] = useState<VerificationReportData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const isDev = import.meta.env.DEV;
  useEffect(() => {
    if (isLegacy || !normalized.rawBundleJson) {
      setReport(null);
      return;
    }
    setReport(null); // reset
    computeVerificationReport(normalized, nodeUrl).then(setReport);
  }, [normalized, isLegacy, nodeUrl]);

  if (isLegacy || !normalized.rawBundleJson) return null;
  if (!report) {
    return <VerdictBanner verdict="PENDING" />;
  }

  return (
    <div className="space-y-3">
      <VerdictBanner verdict={report.verdict} partialReason={report.partialReason} />

      {/* Checks */}
      <div className="space-y-0.5 border border-border rounded-md px-3 py-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground pb-1 border-b border-border mb-1">
          Verification Checks
        </p>
        {report.checks.map((c, i) => (
          <CheckRow key={i} check={c} />
        ))}
      </div>

      {/* Key fields */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono w-full">
          <ChevronDown className={`h-3 w-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
          Report fields
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-0.5 border border-border rounded-md px-3 py-2">
          <FieldRow label="Certificate Hash" value={report.certificateHash} copiable toast={toast} />
          <FieldRow label="Attestor Key ID" value={report.attestorKeyId} copiable toast={toast} />
          <FieldRow label="Protocol Version" value={report.protocolVersion} />
          <FieldRow label="SDK Version" value={report.sdkVersion} />
          <FieldRow label="Execution Timestamp" value={report.executionTimestamp} />
        </CollapsibleContent>
      </Collapsible>

      {/* Signature debug (dev only) */}
      {isDev && report.signatureDebug && (
        <Collapsible open={debugOpen} onOpenChange={setDebugOpen}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono w-full">
            <ChevronDown className={`h-3 w-3 transition-transform ${debugOpen ? "rotate-180" : ""}`} />
            Signature debug
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-0.5 border border-border rounded-md px-3 py-2 bg-muted/20">
            <FieldRow label="Receipt type" value={report.signatureDebug.receiptType} />
            <FieldRow label="Receipt preview" value={report.signatureDebug.receiptPreview} />
            <FieldRow label="Signature" value={report.signatureDebug.signaturePreview} />
            <FieldRow label="Key ID used" value={report.signatureDebug.kidUsed} />
            <FieldRow label="Node URL used" value={report.signatureDebug.nodeUrlUsed} />
            <FieldRow label="Key format" value={report.signatureDebug.keyFormat} />
            <FieldRow label="Serialization" value={report.signatureDebug.serializationMode ?? "unknown"} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function FieldRow({ label, value, copiable, toast }: {
  label: string;
  value: string | null;
  copiable?: boolean;
  toast?: ReturnType<typeof useToast>["toast"];
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className="font-mono text-xs text-foreground truncate">{value ?? "—"}</span>
        {copiable && value && toast && (
          <button onClick={() => copyText(value, label, toast)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
