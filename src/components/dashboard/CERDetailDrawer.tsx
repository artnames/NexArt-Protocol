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
  ShieldCheck, ShieldAlert, ShieldQuestion, Stamp, Info, Ban,
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

type StampStatus = "not_stamped" | "legacy" | "signed";

function deriveStampStatus(n: NormalizedCER): StampStatus {
  const meta = n.rawBundleJson?.meta as Record<string, unknown> | undefined;
  const att = (meta?.attestation ?? null) as Record<string, unknown> | null;

  // Also check top-level normalized fields
  const hasReceipt = !!att?.receipt || !!att?.signatureB64Url;
  const hasLegacy = !!(n.attestationId || n.nodeRuntimeHash || att?.attestationId || att?.nodeRuntimeHash);

  if (hasReceipt) return "signed";
  if (hasLegacy) return "legacy";
  return "not_stamped";
}

function StampStatusBadge({ status, offlineVerifiable }: { status: StampStatus; offlineVerifiable?: boolean }) {
  if (status === "signed") {
    return (
      <Badge className="font-mono text-xs bg-green-600/15 text-green-600 border-green-600/30 gap-1">
        <Stamp className="h-3 w-3" />
        Stamped (signed — offline verifiable)
      </Badge>
    );
  }
  if (status === "legacy") {
    return (
      <Badge className="font-mono text-xs bg-yellow-600/15 text-yellow-600 border-yellow-600/30 gap-1">
        <Stamp className="h-3 w-3" />
        Stamped (legacy — not offline verifiable)
      </Badge>
    );
  }
  return (
    <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border gap-1">
      <ShieldQuestion className="h-3 w-3" />
      Not stamped
    </Badge>
  );
}

// ── Integrity label ─────────────────────────────────────────────────

function IntegrityBadge({ status, reason, isRedacted }: {
  status: NormalizedCER["verificationStatus"];
  reason: string | null;
  isRedacted: boolean;
}) {
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
  const [reAttesting, setReAttesting] = useState(false);
  const [reAttestResult, setReAttestResult] = useState<{ stamp: StampStatus; offlineOk?: boolean } | null>(null);

  const n = event?.normalized;
  const hasBundle = n?.rawBundleJson !== null && n?.rawBundleJson !== undefined;
  const isRedacted = n?.isRedactedExport ?? false;
  const isMismatch = liveVerification.status === "fail";

  // Detect redacted bundle (input/output/prompt stripped)
  const bundleIsRedacted = useMemo(() => {
    const snap = (n?.rawBundleJson as Record<string, unknown>)?.snapshot as Record<string, unknown> | undefined;
    if (!snap) return false;
    return snap.input == null || snap.output == null || snap.prompt == null;
  }, [n]);

  const stampStatus = useMemo(() => {
    if (reAttestResult) return reAttestResult.stamp;
    return n ? deriveStampStatus(n) : "not_stamped";
  }, [n, reAttestResult]);

  // Run live verification when drawer opens with a bundle
  useEffect(() => {
    if (!open || !event || !n?.rawBundleJson || !n?.certificateHash) {
      setLiveVerification({ status: "unavailable", reason: null });
      return;
    }
    setLiveVerification({ status: "pending", reason: null });
    verifyExportBundle(n.rawBundleJson, n.certificateHash).then((result) => {
      setLiveVerification({ status: result.status, reason: result.reason });
    });
  }, [open, event?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset re-attest state when drawer changes
  useEffect(() => {
    setReAttestResult(null);
    setReAttesting(false);
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

  async function handleReAttest() {
    setReAttesting(true);
    setReAttestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("re-attest", {
        body: { usageEventId: Number(event.id) },
      });

      // supabase.functions.invoke wraps non-2xx as error, but data may still contain details
      if (error) {
        // Try to get structured error details from the response
        const errData = data as Record<string, unknown> | null;
        const httpStatus = errData?.httpStatus ?? "";
        const requestId = errData?.requestId ?? "";
        const errMsg = errData?.message ?? error.message ?? "Unknown error";
        const parts = [
          httpStatus ? `HTTP ${httpStatus}` : "",
          String(errMsg).slice(0, 300),
          requestId ? `(requestId: ${requestId})` : "",
        ].filter(Boolean).join(" — ");

        toast({
          variant: "destructive",
          title: "Re-attestation Failed",
          description: parts || "Could not reach the attestation node.",
        });
        return;
      }

      if (data?.error) {
        const parts = [
          data.httpStatus ? `HTTP ${data.httpStatus}` : "",
          String(data.message || "Re-attestation failed").slice(0, 300),
          data.requestId ? `(requestId: ${data.requestId})` : "",
        ].filter(Boolean).join(" — ");
        toast({
          variant: "destructive",
          title: "Re-attestation Failed",
          description: parts,
        });
        return;
      }

      const newStamp: StampStatus = data.stamp === "signed" ? "signed" : "legacy";
      setReAttestResult({ stamp: newStamp, offlineOk: newStamp === "signed" });

      toast({
        title: newStamp === "signed" ? "Signed Receipt Obtained" : "Re-attestation Complete",
        description: newStamp === "signed"
          ? "Stamp: Verified offline. Signed receipt stored."
          : "Legacy attestation updated. No signed receipt returned by node.",
      });
    } catch (err) {
      const e = err as Error;
      toast({
        variant: "destructive",
        title: "Re-attestation Failed",
        description: e.message || "Could not reach the attestation node.",
      });
    } finally {
      setReAttesting(false);
    }
  }

  // Download disabled when MISMATCH
  const downloadDisabled = !hasBundle || isMismatch;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto border-l border-border bg-background">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-mono text-base">Certified Execution Record</SheetTitle>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge completeness={n.completeness} statusCode={n.upstreamStatus ?? 0} />
            {hasBundle && (
              <IntegrityBadge
                status={liveVerification.status}
                reason={liveVerification.reason}
                isRedacted={isRedacted}
              />
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* A) Redacted Export Banner */}
          {isRedacted && hasBundle && (
            <Alert className="border-border bg-muted/30">
              <Info className="h-4 w-4" />
              <AlertTitle className="font-mono text-xs">Redacted Export (Verifiable)</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                This download is redacted to protect sensitive fields. It is still independently verifiable. The original (unredacted) record hash is shown for reference.
              </AlertDescription>
            </Alert>
          )}

          {/* A) Mismatch guardrail banner */}
          {isMismatch && hasBundle && (
            <Alert className="border-destructive/50 bg-destructive/5">
              <Ban className="h-4 w-4 text-destructive" />
              <AlertTitle className="font-mono text-xs text-destructive">Export Blocked</AlertTitle>
              <AlertDescription className="text-xs text-destructive/80">
                This export would not verify. Please refresh or contact support.
              </AlertDescription>
            </Alert>
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
              {n.artifactPath && <p>artifactPath={n.artifactPath}</p>}
            </CollapsibleContent>
          </Collapsible>

          {/* Endpoint note */}
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            {n.endpointNote}
          </p>

          {/* A) Dual hash display */}
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

          {/* B) Stamp Status */}
          <Section title="Stamp Status">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Status</span>
              <StampStatusBadge status={stampStatus} offlineVerifiable={reAttestResult?.offlineOk} />
            </div>
            {reAttestResult?.offlineOk && (
              <div className="flex items-center gap-1.5 py-1">
                <ShieldCheck className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-mono">Stamp: Verified offline</span>
              </div>
            )}
            {(stampStatus === "legacy" || stampStatus === "not_stamped") && !reAttesting && (
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs mt-2 w-full"
                onClick={handleReAttest}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                {bundleIsRedacted ? "Generate signed stamp" : "Re-attest to generate signed receipt"}
              </Button>
            )}
            {reAttesting && (
              <div className="flex items-center gap-2 py-2">
                <RotateCcw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">Re-attesting…</span>
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
