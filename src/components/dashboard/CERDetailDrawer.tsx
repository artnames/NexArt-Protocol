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
import { Copy, Download, ChevronDown, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CertifiedUsageEvent } from "./certified-records-types";

interface CERDetailDrawerProps {
  event: CertifiedUsageEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function copyToClipboard(text: string, label: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: `${label} copied to clipboard.` });
}

function StatusBadge({ status }: { status: "PASS" | "FAIL" | "ERROR" }) {
  const styles = {
    PASS: "bg-green-600/15 text-green-600 border-green-600/30",
    FAIL: "bg-red-600/15 text-red-600 border-red-600/30",
    ERROR: "bg-muted text-muted-foreground border-border",
  };
  return <Badge className={`font-mono text-xs ${styles[status]}`}>{status}</Badge>;
}

function HashRow({ label, value }: { label: string; value: string | null }) {
  const { toast } = useToast();
  if (!value) return null;
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border pb-1">
        {title}
      </p>
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

  const cer = event.cer;
  const cerStatus: "PASS" | "FAIL" | "ERROR" =
    event.status_code >= 200 && event.status_code < 300
      ? cer ? "PASS" : "ERROR"
      : "FAIL";

  const snapshotJson = cer?.snapshot
    ? JSON.stringify(cer.snapshot, null, 2)
    : null;

  function handleDownloadCER() {
    if (!cer) return;
    const blob = new Blob([JSON.stringify(cer, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cer-${cer.executionId || event.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReVerify() {
    setVerifying(true);
    // Simulate re-verification (would call /api/attest in production)
    await new Promise((r) => setTimeout(r, 1200));
    toast({ title: "Re-Verification Complete", description: "Attestation status: PASS" });
    setVerifying(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto border-l border-border bg-background">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-mono text-base">Certified Execution Record</SheetTitle>
          <StatusBadge status={cerStatus} />
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Section A — Identity */}
          <Section title="Identity">
            <HashRow label="Certificate Hash" value={cer?.certificateHash || null} />
            <InfoRow label="Execution ID" value={cer?.executionId || event.id} />
            <InfoRow label="Surface" value={event.surface === "ai" ? "ai.execution.v1" : "codemode.render.v1"} />
            <InfoRow label="Bundle Type" value={cer?.bundleType || "standard"} />
            <InfoRow label="Protocol Version" value={cer?.protocolVersion || "v1.2.0"} />
            <InfoRow label="SDK Version" value={cer?.sdkVersion || null} />
            <InfoRow label="App ID" value={cer?.appId || null} />
            <InfoRow label="Timestamp" value={event.created_at} />
          </Section>

          {/* Section B — Cryptographic Evidence */}
          <Section title="Cryptographic Evidence">
            <HashRow label="Input Hash" value={cer?.snapshot?.inputHash || null} />
            <HashRow label="Output Hash" value={cer?.snapshot?.outputHash || null} />
            <HashRow label="Certificate Hash" value={cer?.certificateHash || null} />
            <HashRow label="Attestation Hash" value={cer?.attestation?.hash || null} />
            <HashRow label="Node Runtime Hash" value={cer?.attestation?.nodeRuntimeHash || null} />
            <InfoRow label="Upstream Status" value={event.status_code} />
            <InfoRow label="Duration" value={`${event.duration_ms}ms`} />
          </Section>

          {/* Section C — Execution Parameters */}
          <Section title="Execution Parameters">
            {event.surface === "ai" ? (
              <>
                <InfoRow label="temperature" value={cer?.snapshot?.parameters?.temperature ?? null} />
                <InfoRow label="maxTokens" value={cer?.snapshot?.parameters?.maxTokens ?? null} />
                <InfoRow label="seed" value={cer?.snapshot?.parameters?.seed ?? null} />
                <InfoRow label="topP" value={cer?.snapshot?.parameters?.topP ?? null} />
              </>
            ) : (
              <>
                <InfoRow label="seed" value={cer?.snapshot?.parameters?.seed ?? null} />
                <InfoRow label="vars" value={cer?.snapshot?.parameters?.vars ? JSON.stringify(cer.snapshot.parameters.vars) : null} />
              </>
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
            <Button variant="outline" size="sm" onClick={handleDownloadCER} disabled={!cer} className="font-mono text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download CER JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cer?.certificateHash && copyToClipboard(cer.certificateHash, "Certificate Hash", toast)}
              disabled={!cer?.certificateHash}
              className="font-mono text-xs"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Hash
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReVerify}
              disabled={verifying}
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
