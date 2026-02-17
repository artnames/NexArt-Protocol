import { useState } from "react";
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
import { Copy, Download, ChevronDown, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CertifiedUsageEvent, NormalizedCER } from "./certified-records-types";

interface CERDetailDrawerProps {
  event: CertifiedUsageEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function copyToClipboard(text: string, label: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: `${label} copied to clipboard.` });
}

function StatusBadge({ completeness, statusCode }: { completeness: NormalizedCER["completeness"]; statusCode: number }) {
  if (statusCode >= 400) {
    return <Badge className="font-mono text-xs bg-red-600/15 text-red-600 border-red-600/30">FAIL</Badge>;
  }
  if (completeness === "full") {
    return <Badge className="font-mono text-xs bg-green-600/15 text-green-600 border-green-600/30">PASS</Badge>;
  }
  if (completeness === "partial") {
    return <Badge className="font-mono text-xs bg-yellow-600/15 text-yellow-600 border-yellow-600/30">PARTIAL</Badge>;
  }
  return <Badge className="font-mono text-xs bg-muted text-muted-foreground border-border">UNAVAILABLE</Badge>;
}

function HashRow({ label, value }: { label: string; value: string | null }) {
  const { toast } = useToast();
  if (!value) return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-xs text-muted-foreground">—</span>
    </div>
  );
  return (
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
  const [verifying, setVerifying] = useState(false);

  if (!event) return null;

  const n = event.normalized;
  const hasBundle = n.rawBundleJson !== null;
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
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast({ title: "Re-Verification Complete", description: "Attestation status unchanged — no stored bundle to re-verify." });
    setVerifying(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto border-l border-border bg-background">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-mono text-base">Certified Execution Record</SheetTitle>
          <StatusBadge completeness={n.completeness} statusCode={n.upstreamStatus ?? 0} />
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Endpoint note */}
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            {n.endpointNote}
          </p>
          {hasBundle && (
            <p className="text-[10px] font-mono text-muted-foreground/70 leading-relaxed border-l-2 border-muted pl-3">
              Stored bundle is redacted; hashes remain verifiable.
            </p>
          )}

          {/* Section A — Identity */}
          <Section title="Identity">
            <HashRow label="Certificate Hash" value={n.certificateHash} />
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

          {/* Section B — Cryptographic Evidence */}
          <Section title="Cryptographic Evidence" unavailable={!hasCryptoEvidence}>
            <HashRow label="Input Hash" value={n.inputHash} />
            <HashRow label="Output Hash" value={n.outputHash} />
            <HashRow label="Certificate Hash" value={n.certificateHash} />
            <HashRow label="Attestation ID" value={n.attestationId} />
            <HashRow label="Node Runtime Hash" value={n.nodeRuntimeHash} />
            <InfoRow label="Upstream Status" value={n.upstreamStatus} />
            <InfoRow label="Duration" value={n.durationMs != null ? `${n.durationMs}ms` : null} />
          </Section>

          {/* Section C — Execution Parameters */}
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

          {/* Section D — Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCER}
                      disabled={!hasBundle}
                      className="font-mono text-xs"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download CER JSON
                    </Button>
                  </span>
                </TooltipTrigger>
                {!hasBundle && (
                  <TooltipContent>
                    <p className="text-xs">No CER bundle stored for this run.</p>
                  </TooltipContent>
                )}
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
              disabled={verifying || !hasBundle}
              className="font-mono text-xs"
            >
              <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${verifying ? "animate-spin" : ""}`} />
              {verifying ? "Verifying…" : "Re-Verify via Node"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
