import { useState, useRef, useCallback } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  Copy,
  Download,
  ChevronDown,
  Loader2,
  FileText,
  Stamp,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  verifyBundle,
  verifyStamp,
  getStampFields,
  type VerifyResult,
  type StampVerifyResult,
} from "@/lib/verifyLocal";

function copyText(text: string, label: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: `${label} copied to clipboard.` });
}

export default function Verify() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [jsonInput, setJsonInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [stampResult, setStampResult] = useState<StampVerifyResult | null>(null);
  const [stampVerifying, setStampVerifying] = useState(false);
  const [parsedBundle, setParsedBundle] = useState<Record<string, unknown> | null>(null);
  const [techOpen, setTechOpen] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);

  const handleVerify = useCallback(
    async (raw?: string) => {
      const text = raw ?? jsonInput;
      if (!text.trim()) {
        toast({ variant: "destructive", title: "Empty input", description: "Paste or upload a CER JSON file." });
        return;
      }

      setVerifying(true);
      setResult(null);
      setStampResult(null);
      setParsedBundle(null);

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setResult({
          ok: false,
          reason: "SCHEMA_ERROR",
          explanation: "The input is not valid JSON. Please check for syntax errors.",
          computedHash: null,
          recordedHash: null,
          detail: "JSON.parse() failed.",
          meta: {
            bundleType: null,
            createdAt: null,
            appId: null,
            provider: null,
            model: null,
            executionId: null,
            protocolVersion: null,
          },
        });
        setVerifying(false);
        return;
      }

      setParsedBundle(parsed as Record<string, unknown>);
      const verifyResult = await verifyBundle(parsed);
      setResult(verifyResult);
      setVerifying(false);
    },
    [jsonInput, toast],
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setJsonInput(text);
        handleVerify(text);
      };
      reader.readAsText(file);
      // Reset so same file can be re-uploaded
      e.target.value = "";
    },
    [handleVerify],
  );

  const handleStampVerify = useCallback(async () => {
    if (!parsedBundle) return;
    setStampVerifying(true);
    const sr = await verifyStamp(parsedBundle);
    setStampResult(sr);
    setStampVerifying(false);
  }, [parsedBundle]);

  const handleDownload = useCallback(() => {
    if (!jsonInput.trim()) return;
    const blob = new Blob([jsonInput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cer-record.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonInput]);

  const stampFields = parsedBundle ? getStampFields(parsedBundle) : null;

  return (
    <PageLayout>
      <SEOHead
        title="Verify CER Record — NexArt"
        description="Verify any Certified Execution Record (CER) entirely in your browser. No data is uploaded."
      />
      <PageHeader
        title="Verify"
        subtitle="Paste or upload a CER JSON file to verify its integrity. All verification runs locally in your browser, no data is sent to any server."
      />

      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-8">
        {/* Input area */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CER Record Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder='Paste CER JSON here (e.g. {"bundleType":"cer.ai.execution.v1", ...})'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="font-mono text-xs min-h-[160px] resize-y"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleVerify()}
                disabled={verifying || !jsonInput.trim()}
                className="font-mono text-xs"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                    Verify
                  </>
                )}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()} className="font-mono text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload File
              </Button>
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Runs locally in your browser. No data is uploaded.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Result card */}
        {result && (
          <Card
            className={
              result.ok ? "border-green-600/30 bg-green-600/[0.03]" : "border-destructive/30 bg-destructive/[0.03]"
            }
          >
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                {result.ok ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                )}
                Audit Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main verdict */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  className={`font-mono text-sm px-3 py-1 ${
                    result.ok
                      ? "bg-green-600/15 text-green-600 border-green-600/30"
                      : "bg-red-600/15 text-red-600 border-red-600/30"
                  }`}
                >
                  {result.ok ? "Integrity: Verified" : "Integrity: Not Verified"}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {result.reason}
                </Badge>
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 ml-auto">
                  <ShieldCheck className="h-3 w-3" />
                  Verified locally in your browser
                </span>
              </div>

              {/* Plain English explanation */}
              <p className="text-sm text-foreground leading-relaxed">{result.explanation}</p>

              {/* Redacted export banner */}
              {parsedBundle?.meta &&
                (parsedBundle.meta as Record<string, unknown>)?.provenance &&
                ((parsedBundle.meta as Record<string, unknown>).provenance as Record<string, unknown>)?.kind ===
                  "redacted_export" && (
                  <div className="border border-border rounded-md bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs font-medium">Redacted Export (Verifiable)</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This file hides sensitive fields. It is still independently verifiable. The original (unredacted)
                      hash is shown for reference.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          Redacted Certificate Hash (this file)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-foreground truncate">
                            {result.recordedHash ?? "—"}
                          </span>
                          {result.recordedHash && (
                            <button
                              onClick={() => copyText(result.recordedHash!, "Redacted hash", toast)}
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          Original Hash (reference only)
                        </span>
                        {(() => {
                          const origHash = (
                            (parsedBundle!.meta as Record<string, unknown>).provenance as Record<string, unknown>
                          ).originalCertificateHash as string | undefined;
                          return origHash ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-foreground truncate">{origHash}</span>
                                <button
                                  onClick={() => copyText(origHash, "Original hash", toast)}
                                  className="shrink-0 text-muted-foreground hover:text-foreground"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="text-[9px] font-mono text-muted-foreground/60">
                                The original hash cannot be verified from a redacted export.
                              </p>
                            </>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">—</span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

              {/* Metadata summary */}
              {result.meta.bundleType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 py-3 border-t border-b border-border">
                  <MetaRow label="Record type" value={result.meta.bundleType} />
                  <MetaRow label="Created at" value={result.meta.createdAt} />
                  <MetaRow label="App" value={result.meta.appId} />
                  {result.meta.bundleType === "cer.ai.execution.v1" && (
                    <>
                      <MetaRow label="Provider" value={result.meta.provider} />
                      <MetaRow label="Model" value={result.meta.model} />
                    </>
                  )}
                  <MetaRow label="Execution ID" value={result.meta.executionId} />
                  <MetaRow label="Protocol version" value={result.meta.protocolVersion} />
                </div>
              )}

              {/* Certificate ID + actions */}
              {result.recordedHash && (
                <div className="flex flex-wrap items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => copyText(result.recordedHash!, "Certificate ID", toast)}
                          className="flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Certificate ID
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-[10px] max-w-xs break-all">{result.recordedHash}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="font-mono text-xs">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download record
                  </Button>
                </div>
              )}

              {/* Stamp status */}
              {stampFields && stampFields.hasStamp && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Stamp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                      Node Attestation Stamp
                    </span>
                  </div>
                  {stampFields.isLegacy && !stampResult && (
                    <p className="text-xs text-muted-foreground">
                      Stamped (legacy) — not offline-verifiable. Legacy stamps require contacting the attestation node.
                    </p>
                  )}
                  {stampFields.isSigned && !stampResult && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs"
                      onClick={handleStampVerify}
                      disabled={stampVerifying}
                    >
                      {stampVerifying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Verifying stamp…
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                          Verify stamp offline
                        </>
                      )}
                    </Button>
                  )}
                  {stampResult && (
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`font-mono text-xs ${
                          stampResult.ok
                            ? "bg-green-600/15 text-green-600 border-green-600/30"
                            : "bg-yellow-600/15 text-yellow-600 border-yellow-600/30"
                        }`}
                      >
                        {stampResult.ok ? "Stamp: Verified offline" : stampResult.reason}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{stampResult.explanation}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Technical details accordion */}
              <Collapsible open={techOpen} onOpenChange={setTechOpen}>
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className={`h-3 w-3 transition-transform ${techOpen ? "rotate-180" : ""}`} />
                  Technical details
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="bg-muted/50 border border-border rounded p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason code</span>
                      <span>{result.reason}</span>
                    </div>
                    {result.computedHash && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Computed hash</span>
                        <span className="truncate text-right">{result.computedHash}</span>
                      </div>
                    )}
                    {result.recordedHash && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Recorded hash</span>
                        <span className="truncate text-right">{result.recordedHash}</span>
                      </div>
                    )}
                    {result.detail && (
                      <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap mt-2 border-t border-border pt-2">
                        {result.detail}
                      </pre>
                    )}
                    {stampResult?.detail && (
                      <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap mt-2 border-t border-border pt-2">
                        Stamp: {stampResult.detail}
                      </pre>
                    )}
                  </div>

                  {/* Raw JSON viewer */}
                  {parsedBundle && (
                    <Collapsible open={rawOpen} onOpenChange={setRawOpen}>
                      <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className={`h-3 w-3 transition-transform ${rawOpen ? "rotate-180" : ""}`} />
                        Raw JSON
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <pre className="bg-muted/50 border border-border rounded p-3 text-[10px] font-mono text-foreground overflow-x-auto max-h-80 overflow-y-auto">
                          {JSON.stringify(parsedBundle, null, 2)}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

function MetaRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground text-right truncate max-w-[200px]">{value || "—"}</span>
    </div>
  );
}
