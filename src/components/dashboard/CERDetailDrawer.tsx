import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Copy, Download, ChevronDown, RotateCcw, Image as ImageIcon,
  ShieldCheck, ShieldAlert, ShieldQuestion, Stamp, Info, Ban, Hash,
  RefreshCw, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CertifiedUsageEvent, NormalizedCER } from "./certified-records-types";
import { verifyExportBundle } from "./certified-records-types";

interface CERDetailDrawerProps {
  event: CertifiedUsageEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function copyToClipboard(text: string, label: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: `${label} copied to clipboard.` });
}

// ── Stamp status derivation ─────────────────────────────────────────

type StampStatus =
  | "not_attested"
  | "legacy_record_not_verifiable"
  | "signed_full"
  | "signed_redacted_reseal"
  | "hash_only_timestamp";

function deriveStampStatus(n: NormalizedCER): StampStatus {
  const meta = n.rawBundleJson?.meta as Record<string, unknown> | undefined;
  const att = (meta?.attestation ?? null) as Record<string, unknown> | null;

  const hasReceipt = !!att?.receipt || !!att?.signatureB64Url;
  const hasLegacy = !!(n.attestationId || n.nodeRuntimeHash || att?.attestationId || att?.nodeRuntimeHash);
  const mode = att?.mode as string | undefined;

  if (hasReceipt) {
    if (mode === 'hash-only') return 'hash_only_timestamp';
    if (mode === 'redacted_reseal') return 'signed_redacted_reseal';
    return 'signed_full';
  }
  if (hasLegacy) return "legacy_record_not_verifiable";
  return "not_attested";
}

// ── Detect if this is a legacy Code Mode record (not a full CER) ──
function isLegacyCodeModeRecord(n: NormalizedCER): boolean {
  if (n.surface !== "code") return false;
  // Legacy if missing core CER fields
  return !n.inputHash && !n.outputHash && !n.protocolVersion && !n.sdkVersion;
}

function StampStatusBadge({ status }: { status: StampStatus }) {
  switch (status) {
    case "signed_full":
      return (
        <Badge className="font-mono text-xs bg-green-600/15 text-green-600 border-green-600/30 gap-1">
          <Stamp className="h-3 w-3" />
          Stamped (signed — full)
        </Badge>
      );
    case "signed_redacted_reseal":
      return (
        <Badge className="font-mono text-xs bg-blue-600/15 text-blue-600 border-blue-600/30 gap-1">
          <RefreshCw className="h-3 w-3" />
          Stamped (signed — redacted reseal)
        </Badge>
      );
    case "hash_only_timestamp":
      return (
        <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border gap-1">
          <Clock className="h-3 w-3" />
          Hash-only timestamp
        </Badge>
      );
    case "legacy_record_not_verifiable":
      return (
        <Badge className="font-mono text-xs bg-yellow-600/15 text-yellow-600 border-yellow-600/30 gap-1">
          <ShieldQuestion className="h-3 w-3" />
          Legacy (not offline verifiable)
        </Badge>
      );
    default:
      return (
        <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border gap-1">
          <ShieldQuestion className="h-3 w-3" />
          Not attested
        </Badge>
      );
  }
}

const stampExplanations: Record<StampStatus, string> = {
  not_attested: "This record has no attestation from the node.",
  legacy_record_not_verifiable: "Has attestationId/nodeRuntimeHash but no cryptographic signature. Cannot be verified offline.",
  signed_full: "Signed receipt from the node (offline-verifiable). Stamping does not re-run execution; it signs integrity evidence.",
  signed_redacted_reseal: "Redacted snapshot was resealed with a new certificateHash and attested. Original hash preserved in provenance.",
  hash_only_timestamp: "Node signed the certificateHash as a timestamp observation. Does NOT attest snapshot contents.",
};

// ── Integrity label ─────────────────────────────────────────────────

function IntegrityBadge({ status, reason, isRedacted, isLegacyCode }: {
  status: NormalizedCER["verificationStatus"];
  reason: string | null;
  isRedacted: boolean;
  isLegacyCode: boolean;
}) {
  if (isLegacyCode) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border gap-1">
              <Info className="h-3 w-3" />
              Legacy record (not verifiable)
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">Legacy record (not a full CER). Integrity cannot be verified from available data.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (status === "pass") {
    const label = isRedacted ? "Integrity: Verified (Redacted Export)" : "Integrity: Verified";
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="font-mono text-xs bg-green-600/15 text-green-600 border-green-600/30 gap-1">
              <ShieldCheck className="h-3 w-3" />
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">Certificate hash matches exported payload. Will pass Recânon verification.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (status === "fail") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="font-mono text-xs bg-red-600/15 text-red-600 border-red-600/30 gap-1">
              <ShieldAlert className="h-3 w-3" />
              Integrity: Mismatch
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{reason || "Certificate hash does not match payload."}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (status === "pending") {
    return <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border">Verifying…</Badge>;
  }
  return <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border">Unavailable</Badge>;
}

// ── Mismatch diagnostics ────────────────────────────────────────────

function MismatchDiagnostics({ n, reason }: { n: NormalizedCER; reason: string | null }) {
  const bundle = n.rawBundleJson as Record<string, unknown> | null;
  const snap = bundle?.snapshot as Record<string, unknown> | undefined;

  const isEnveloped = !!(bundle?.bundleType && bundle?.certificateHash && bundle?.createdAt && bundle?.snapshot);
  const isLegacyFlat = !!bundle && !isEnveloped;
  const isRedacted = snap != null && (snap.input == null || snap.output == null || snap.prompt == null);

  const missingFields: string[] = [];
  if (!bundle?.certificateHash && !n.certificateHash) missingFields.push('certificateHash');
  if (!snap) missingFields.push('snapshot');
  if (snap && snap.input == null) missingFields.push('snapshot.input');
  if (snap && snap.output == null) missingFields.push('snapshot.output');
  if (snap && snap.prompt == null) missingFields.push('snapshot.prompt');
  if (!n.inputHash) missingFields.push('inputHash');
  if (!n.outputHash) missingFields.push('outputHash');

  let code = 'UNKNOWN';
  if (reason?.toLowerCase().includes('hash')) code = 'CERTIFICATE_HASH_MISMATCH';
  else if (reason?.toLowerCase().includes('schema')) code = 'SCHEMA_ERROR';
  else if (missingFields.length > 0) code = 'INCOMPLETE_RECORD';

  const format = isEnveloped ? 'enveloped (CER)' : isLegacyFlat ? 'legacy flat' : 'unknown';

  return (
    <Collapsible className="mt-2">
      <CollapsibleTrigger className="flex items-center gap-1.5 text-[10px] text-red-500 hover:text-red-400 transition-colors font-mono">
        <ChevronDown className="h-3 w-3" />
        Why?
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-1 text-[10px] font-mono text-muted-foreground bg-muted/30 rounded p-2 border border-border">
        <p><span className="text-red-500">Code:</span> {code}</p>
        <p><span className="text-muted-foreground">Format:</span> {format}{isRedacted ? ' (redacted)' : ''}</p>
        {missingFields.length > 0 && (
          <p><span className="text-muted-foreground">Missing:</span> {missingFields.join(', ')}</p>
        )}
        {reason && <p><span className="text-muted-foreground">Detail:</span> {reason}</p>}
      </CollapsibleContent>
    </Collapsible>
  );
}

function StatusBadge({ completeness, statusCode }: { completeness: NormalizedCER["completeness"]; statusCode: number }) {
  if (statusCode >= 400) {
    return <Badge className="font-mono text-xs bg-red-600/15 text-red-600 border-red-600/30">FAIL</Badge>;
  }
  if (completeness === "full") {
    return <Badge className="font-mono text-xs bg-green-600/15 text-green-600 border-green-600/30">FULL</Badge>;
  }
  if (completeness === "partial") {
    return <Badge className="font-mono text-xs bg-yellow-600/15 text-yellow-600 border-yellow-600/30">PARTIAL</Badge>;
  }
  return <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border">UNAVAILABLE</Badge>;
}

function HashRow({ label, value, note }: { label: string; value: string | null; note?: string }) {
  const { toast } = useToast();
  if (!value) return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-xs text-muted-foreground">—</span>
    </div>
  );
  return (
    <div className="space-y-0.5">
      <div className="flex items-start justify-between gap-2 py-1.5">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-xs text-foreground truncate">{value}</span>
          <button
            onClick={() => copyToClipboard(value, label, toast)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
      {note && (
        <p className="text-[9px] font-mono text-muted-foreground/60 pl-1">{note}</p>
      )}
    </div>
  );
}

function Section({ title, unavailable, children }: { title: string; unavailable?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {unavailable && (
          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">
            — Unavailable from logs
          </span>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export default function CERDetailDrawer({ event, open, onOpenChange }: CERDetailDrawerProps) {
  const { toast } = useToast();
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [liveVerification, setLiveVerification] = useState<{ status: NormalizedCER["verificationStatus"]; reason: string | null }>({
    status: "unavailable",
    reason: null,
  });
  const [actionInProgress, setActionInProgress] = useState<null | 'reattest' | 'reseal' | 'hashonly'>(null);
  const [actionResult, setActionResult] = useState<{
    stamp: StampStatus;
    legacyWrapped?: boolean;
    wrapReason?: string;
    newCertificateHash?: string;
    originalCertificateHash?: string;
  } | null>(null);

  const n = event?.normalized;
  const hasBundle = n?.rawBundleJson !== null && n?.rawBundleJson !== undefined;
  const isRedacted = n?.isRedactedExport ?? false;
  const isLegacyCode = n ? isLegacyCodeModeRecord(n) : false;
  const isMismatch = liveVerification.status === "fail" && !isLegacyCode;

  // Detect redacted bundle (input/output/prompt stripped)
  const bundleIsRedacted = useMemo(() => {
    const snap = (n?.rawBundleJson as Record<string, unknown>)?.snapshot as Record<string, unknown> | undefined;
    if (!snap) return false;
    return snap.input == null || snap.output == null || snap.prompt == null;
  }, [n]);

  const stampStatus = useMemo(() => {
    if (actionResult) return actionResult.stamp;
    return n ? deriveStampStatus(n) : "not_attested";
  }, [n, actionResult]);

  // Run live verification when drawer opens with a bundle
  useEffect(() => {
    if (!open || !event || !n?.rawBundleJson || !n?.certificateHash) {
      setLiveVerification({ status: "unavailable", reason: null });
      return;
    }
    // Skip verification for legacy Code Mode records
    if (isLegacyCodeModeRecord(n)) {
      setLiveVerification({ status: "unavailable", reason: null });
      return;
    }
    setLiveVerification({ status: "pending", reason: null });
    verifyExportBundle(n.rawBundleJson, n.certificateHash).then((result) => {
      setLiveVerification({ status: result.status, reason: result.reason });
    });
  }, [open, event?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when drawer changes
  useEffect(() => {
    setActionResult(null);
    setActionInProgress(null);
  }, [event?.id]);

  if (!event || !n) return null;

  const hasCryptoEvidence = !!(n.inputHash || n.outputHash || n.certificateHash || n.attestationId);
  const hasParams = n.parameters !== null && Object.keys(n.parameters).length > 0;
  const snapshotJson = n.snapshotJson ? JSON.stringify(n.snapshotJson, null, 2) : null;

  function handleDownloadCER() {
    if (!n.rawBundleJson) return;
    const blob = new Blob([JSON.stringify(n.rawBundleJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cer-${n.executionId || event.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReVerify() {
    if (!n.rawBundleJson || !n.certificateHash) return;
    setLiveVerification({ status: "pending", reason: null });
    const result = await verifyExportBundle(n.rawBundleJson, n.certificateHash);
    setLiveVerification({ status: result.status, reason: result.reason });
    toast({
      title: result.status === "pass" ? "Verification Passed" : "Verification Failed",
      description: result.status === "pass"
        ? "Certificate hash matches the exported payload."
        : result.reason || "Hash mismatch detected.",
    });
  }

  // ── Flow A: Re-attest (full) ──
  async function handleReAttest() {
    setActionInProgress('reattest');
    setActionResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("re-attest", {
        body: { usageEventId: Number(event.id) },
      });

      if (error) {
        const errData = data as Record<string, unknown> | null;
        const errError = errData?.error as string | undefined;

        if (errError === 'LOCAL_VERIFY_FAILED') {
          toast({
            variant: "destructive",
            title: "Full re-attestation not possible",
            description: (errData?.message as string) || "Local verification failed. Use reseal for redacted bundles.",
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "Re-attestation Failed",
          description: String(errData?.message ?? error.message ?? "Unknown error").slice(0, 300),
        });
        return;
      }

      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Re-attestation Failed",
          description: String(data.message || "Failed").slice(0, 300),
        });
        return;
      }

      const newStamp: StampStatus = data.stamp === "signed" ? "signed_full" : "legacy_record_not_verifiable";
      setActionResult({
        stamp: newStamp,
        legacyWrapped: !!data.legacyWrapped,
        wrapReason: data.wrapReason ?? undefined,
      });
      toast({
        title: newStamp === "signed_full" ? "Signed Receipt Obtained" : "Re-attestation Complete",
        description: newStamp === "signed_full"
          ? "Signed receipt obtained and stored. Offline-verifiable. Stamping does not re-run execution."
          : "Legacy attestation updated. No signed receipt returned by node.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Re-attestation Failed", description: (err as Error).message });
    } finally {
      setActionInProgress(null);
    }
  }

  // ── Flow B: Reseal redacted + attest ──
  async function handleResealAttest() {
    setActionInProgress('reseal');
    setActionResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("reseal-attest", {
        body: { usageEventId: Number(event.id) },
      });

      if (error) {
        const errData = data as Record<string, unknown> | null;
        toast({
          variant: "destructive",
          title: "Reseal Failed",
          description: String(errData?.message ?? error.message ?? "Unknown error").slice(0, 300),
        });
        return;
      }

      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Reseal Failed",
          description: String(data.message || "Reseal failed").slice(0, 300),
        });
        return;
      }

      const newStamp: StampStatus = data.stamp === "signed_redacted_reseal" ? "signed_redacted_reseal" : "legacy_record_not_verifiable";
      setActionResult({
        stamp: newStamp,
        newCertificateHash: data.newCertificateHash,
        originalCertificateHash: data.originalCertificateHash,
      });
      toast({
        title: "Redacted Reseal Complete",
        description: `New certificateHash computed over redacted payload and attested. Original hash preserved in provenance.`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Reseal Failed", description: (err as Error).message });
    } finally {
      setActionInProgress(null);
    }
  }

  // ── Flow C: Hash-only timestamp ──
  async function handleStampHash() {
    setActionInProgress('hashonly');
    setActionResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("stamp-hash", {
        body: { usageEventId: Number(event.id) },
      });

      if (error) {
        const errData = data as Record<string, unknown> | null;
        const errError = errData?.error as string | undefined;

        if (errError === 'NODE_HASH_ONLY_UNSUPPORTED') {
          toast({
            variant: "destructive",
            title: "Hash-only timestamp not yet supported",
            description: (errData?.message as string) || "Node does not support hash-only mode yet.",
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "Timestamp Failed",
          description: String(errData?.message ?? error.message ?? "Unknown error").slice(0, 300),
        });
        return;
      }

      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Timestamp Failed",
          description: String(data.message || "Failed").slice(0, 300),
        });
        return;
      }

      setActionResult({ stamp: "hash_only_timestamp" });
      toast({
        title: "Hash-Only Timestamp Recorded",
        description: "The node signed the certificateHash as a timestamp. This does NOT attest snapshot contents.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Timestamp Failed", description: (err as Error).message });
    } finally {
      setActionInProgress(null);
    }
  }

  // Download disabled when MISMATCH (but not for legacy code mode)
  const downloadDisabled = !hasBundle || isMismatch;
  const isActioning = actionInProgress !== null;

  // Determine which actions are available
  const canFullReattest = !isActioning && (stampStatus === "not_attested" || stampStatus === "legacy_record_not_verifiable") && !bundleIsRedacted && !isLegacyCode;
  const canReseal = !isActioning && (stampStatus === "not_attested" || stampStatus === "legacy_record_not_verifiable") && bundleIsRedacted && n.surface === "ai";
  const canHashOnly = !isActioning && (stampStatus === "not_attested" || stampStatus === "legacy_record_not_verifiable" || stampStatus === "hash_only_timestamp");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto border-l border-border bg-background">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-mono text-base">Certified Execution Record</SheetTitle>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge completeness={n.completeness} statusCode={n.upstreamStatus ?? 0} />
            {hasBundle && (
              <IntegrityBadge
                status={isLegacyCode ? "unavailable" : liveVerification.status}
                reason={liveVerification.reason}
                isRedacted={isRedacted}
                isLegacyCode={isLegacyCode}
              />
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Legacy Code Mode banner */}
          {isLegacyCode && hasBundle && (
            <Alert className="border-border bg-muted/30">
              <Info className="h-4 w-4" />
              <AlertTitle className="font-mono text-xs">Legacy Record</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                Legacy record (not a full CER). Integrity cannot be verified from available data. You can use hash-only timestamp if a certificateHash exists.
              </AlertDescription>
            </Alert>
          )}

          {/* Redacted Export Banner */}
          {isRedacted && hasBundle && !isLegacyCode && (
            <Alert className="border-border bg-muted/30">
              <Info className="h-4 w-4" />
              <AlertTitle className="font-mono text-xs">Redacted Export (Verifiable)</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                This export verifies integrity of the redacted record only. Original hash cannot be verified from this export. The original (unredacted) certificate hash is shown below for reference.
              </AlertDescription>
            </Alert>
          )}

          {/* Legacy transport wrap banner */}
          {actionResult?.legacyWrapped && (
            <Alert className="border-yellow-600/30 bg-yellow-600/5">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="font-mono text-xs text-yellow-600">Legacy record wrapped for attestation</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                We preserved the original certificate hash and timestamp. No reseal was performed. The stamp verifies the submitted hash (not a regenerated seal).
              </AlertDescription>
            </Alert>
          )}

          {/* Reseal result banner */}
          {actionResult?.stamp === "signed_redacted_reseal" && (
            <Alert className="border-blue-600/30 bg-blue-600/5">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <AlertTitle className="font-mono text-xs text-blue-600">Redacted Reseal Complete</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground leading-relaxed space-y-1">
                <p>A new certificateHash was computed over the redacted snapshot and attested by the node.</p>
                {actionResult.newCertificateHash && (
                  <p className="font-mono text-[10px] break-all">New: {actionResult.newCertificateHash}</p>
                )}
                {actionResult.originalCertificateHash && (
                  <p className="font-mono text-[10px] break-all">Original (reference): {actionResult.originalCertificateHash}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Mismatch guardrail banner + diagnostics (NOT for legacy code mode) */}
          {isMismatch && hasBundle && (
            <>
              <Alert className="border-destructive/50 bg-destructive/5">
                <Ban className="h-4 w-4 text-destructive" />
                <AlertTitle className="font-mono text-xs text-destructive">Export Blocked</AlertTitle>
                <AlertDescription className="text-xs text-destructive/80">
                  This export would not verify. Please refresh or contact support.
                </AlertDescription>
              </Alert>
              <MismatchDiagnostics n={n} reason={liveVerification.reason} />
            </>
          )}

          {/* Debug lookup line */}
          <Collapsible className="border border-border rounded px-3 py-1.5">
            <CollapsibleTrigger className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono w-full">
              <ChevronDown className="h-3 w-3" />
              Bundle Lookup Debug
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 text-[10px] font-mono text-muted-foreground">
              <p>usageEventId={event.id} → found={hasBundle ? "true" : "false"}</p>
              <p>surface={n.surface} completeness={n.completeness}</p>
              {n.bundleType && <p>bundleType={n.bundleType}</p>}
              {n.certificateHash && <p>certificateHash={n.certificateHash}</p>}
              {n.originalCertificateHash && n.originalCertificateHash !== n.certificateHash && (
                <p>originalCertificateHash={n.originalCertificateHash}</p>
              )}
              {n.isRedactedExport && <p>export=redacted (hash recomputed over redacted payload)</p>}
              {isLegacyCode && <p>legacyCodeMode=true (missing CER fields)</p>}
              {n.artifactPath && <p>artifactPath={n.artifactPath}</p>}
            </CollapsibleContent>
          </Collapsible>

          {/* Endpoint note */}
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            {n.endpointNote}
          </p>

          {/* Dual hash display */}
          {hasBundle && (
            <Section title="Certificate Hashes">
              <HashRow
                label={isRedacted ? "Redacted Certificate Hash (this download)" : "Certificate Hash"}
                value={n.certificateHash}
              />
              {isRedacted && n.originalCertificateHash && (
                <HashRow
                  label="Original Certificate Hash (historic, unredacted)"
                  value={n.originalCertificateHash}
                  note="Original hash cannot be verified from this redacted export."
                />
              )}
            </Section>
          )}

          {/* Section — Identity */}
          <Section title="Identity">
            <InfoRow label="Execution ID" value={n.executionId} />
            <InfoRow
              label="Surface"
              value={n.surface === "ai" ? "ai.execution.v1" : "codemode.render.v1"}
            />
            <InfoRow label="Bundle Type" value={n.bundleType} />
            <InfoRow label="Protocol Version" value={n.protocolVersion} />
            <InfoRow label="SDK Version" value={n.sdkVersion} />
            <InfoRow label="App ID" value={n.appId} />
            <InfoRow label="Timestamp" value={n.timestamp} />
          </Section>

          {/* Section — Cryptographic Evidence */}
          <Section title="Cryptographic Evidence" unavailable={!hasCryptoEvidence}>
            <HashRow label="Input Hash" value={n.inputHash} />
            <HashRow label="Output Hash" value={n.outputHash} />
            <HashRow label="Attestation ID" value={n.attestationId} />
            <HashRow label="Node Runtime Hash" value={n.nodeRuntimeHash} />
            <InfoRow label="Upstream Status" value={n.upstreamStatus} />
            <InfoRow label="Duration" value={n.durationMs != null ? `${n.durationMs}ms` : null} />
          </Section>

          {/* Stamp Status */}
          <Section title="Stamp Status">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Status</span>
              <StampStatusBadge status={stampStatus} />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono py-1">
              {stampExplanations[stampStatus]}
            </p>
            {stampStatus === "signed_full" && (
              <div className="flex items-center gap-1.5 py-1">
                <ShieldCheck className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-mono">Signed receipt — offline verifiable</span>
              </div>
            )}
            {stampStatus === "signed_redacted_reseal" && (
              <div className="flex items-center gap-1.5 py-1">
                <RefreshCw className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600 font-mono">Redacted reseal — new hash attested, original preserved</span>
              </div>
            )}

            {/* Three action buttons */}
            {!isActioning && (canFullReattest || canReseal || canHashOnly) && (
              <div className="flex flex-col gap-2 mt-3">
                {canFullReattest && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs w-full"
                    onClick={handleReAttest}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Re-attest (full)
                  </Button>
                )}
                {canReseal && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs w-full border-blue-600/30 text-blue-600 hover:bg-blue-600/5"
                    onClick={handleResealAttest}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Reseal redacted + attest
                  </Button>
                )}
                {canHashOnly && (
                  <div className="space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs w-full text-muted-foreground"
                      onClick={handleStampHash}
                    >
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      Hash-only timestamp
                    </Button>
                    <p className="text-[9px] font-mono text-muted-foreground/60 px-1">
                      Does NOT attest snapshot contents. Provides a signed timestamp of the certificateHash only.
                    </p>
                  </div>
                )}
              </div>
            )}
            {isActioning && (
              <div className="flex items-center gap-2 py-2">
                <RotateCcw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">
                  {actionInProgress === 'reattest' ? "Re-attesting…" :
                   actionInProgress === 'reseal' ? "Resealing + attesting…" :
                   "Stamping hash…"}
                </span>
              </div>
            )}
          </Section>

          {/* Section — Execution Parameters */}
          <Section title="Execution Parameters" unavailable={!hasParams}>
            {hasParams && n.surface === "ai" ? (
              <>
                <InfoRow label="temperature" value={n.parameters?.temperature as number ?? null} />
                <InfoRow label="maxTokens" value={n.parameters?.maxTokens as number ?? null} />
                <InfoRow label="seed" value={n.parameters?.seed as string ?? null} />
                <InfoRow label="topP" value={n.parameters?.topP as number ?? null} />
              </>
            ) : hasParams && n.surface === "code" ? (
              <>
                <InfoRow label="seed" value={n.parameters?.seed as string ?? null} />
                <InfoRow
                  label="vars"
                  value={n.parameters?.vars ? JSON.stringify(n.parameters.vars) : null}
                />
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-1.5">
                No execution parameters recorded for this run.
              </p>
            )}

            {snapshotJson && (
              <Collapsible open={snapshotOpen} onOpenChange={setSnapshotOpen} className="mt-3">
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
                  <ChevronDown className={`h-3 w-3 transition-transform ${snapshotOpen ? "rotate-180" : ""}`} />
                  View Snapshot JSON
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <pre className="bg-muted/50 border border-border rounded p-3 text-[11px] font-mono text-foreground overflow-x-auto max-h-64 overflow-y-auto">
                    {snapshotJson}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </Section>

          {/* Section — Artifact */}
          {n.artifactPath && (
            <Section title="Output Artifact">
              <InfoRow label="Type" value={n.artifactMime} />
              <InfoRow label="Path" value={n.artifactPath} />
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs mt-2"
                onClick={async () => {
                  const { data } = await supabase.storage
                    .from('certified-artifacts')
                    .createSignedUrl(n.artifactPath!, 300);
                  if (data?.signedUrl) {
                    window.open(data.signedUrl, '_blank');
                  } else {
                    toast({ variant: "destructive", title: "Error", description: "Failed to generate signed URL." });
                  }
                }}
              >
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                View Output (PNG)
              </Button>
            </Section>
          )}

          {/* Section — Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCER}
                      disabled={downloadDisabled}
                      className="font-mono text-xs"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {isRedacted ? "Download Verifiable Redacted CER" : "Download CER JSON"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {isMismatch ? (
                  <TooltipContent>
                    <p className="text-xs max-w-xs">This export would not verify. Please refresh or contact support.</p>
                  </TooltipContent>
                ) : !hasBundle ? (
                  <TooltipContent>
                    <p className="text-xs">No CER bundle stored for this run.</p>
                  </TooltipContent>
                ) : isRedacted ? (
                  <TooltipContent>
                    <p className="text-xs max-w-xs">This is redacted. It verifies integrity of the redacted record. Original content is not included.</p>
                  </TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              size="sm"
              onClick={() => n.certificateHash && copyToClipboard(n.certificateHash, "Certificate Hash", toast)}
              disabled={!n.certificateHash}
              className="font-mono text-xs"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Hash
            </Button>
            {!isLegacyCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReVerify}
                disabled={liveVerification.status === "pending" || !hasBundle}
                className="font-mono text-xs"
              >
                <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${liveVerification.status === "pending" ? "animate-spin" : ""}`} />
                {liveVerification.status === "pending" ? "Verifying…" : "Re-Verify"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
