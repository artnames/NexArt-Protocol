/**
 * Public verification page for /e/:executionId and /c/:certificateHash routes.
 * Loads record from the public lookup endpoint and renders verification.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import DecisionReceipt from "@/components/verify/DecisionReceipt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ShieldCheck, ShieldAlert, Copy, Download, ChevronDown, Loader2,
  FileText, Stamp, Info, ShieldQuestion,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  verifyBundle, verifyStamp, getStampFields,
  type VerifyResult, type StampVerifyResult,
} from "@/lib/verifyLocal";
import { getVerificationUrl } from "@/lib/verification-url";

function copyText(text: string, label: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied", description: `${label} copied to clipboard.` });
}

type LookupMode = "executionId" | "certificateHash";

export default function VerifyPublic() {
  const { executionId, certificateHash } = useParams<{ executionId?: string; certificateHash?: string }>();
  const { toast } = useToast();

  const mode: LookupMode = executionId ? "executionId" : "certificateHash";
  const lookupValue = executionId ?? certificateHash ?? "";

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [parsedBundle, setParsedBundle] = useState<Record<string, unknown> | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [stampResult, setStampResult] = useState<StampVerifyResult | null>(null);
  const [stampVerifying, setStampVerifying] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [appName, setAppName] = useState<string | null>(null);

  const [techOpen, setTechOpen] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);

  // Fetch and verify on mount
  useEffect(() => {
    if (!lookupValue) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setFetchError(null);
      setResult(null);
      setStampResult(null);
      setParsedBundle(null);

      try {
        const params = new URLSearchParams();
        if (mode === "executionId") params.set("executionId", lookupValue);
        else params.set("certificateHash", lookupValue);

        const baseUrl = import.meta.env.VITE_SUPABASE_URL;
        const resp = await fetch(
          `${baseUrl}/functions/v1/public-cer-lookup?${params.toString()}`,
          {
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        if (resp.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          if (!cancelled) setFetchError(errData.message ?? `HTTP ${resp.status}`);
          return;
        }

        const payload = await resp.json();
        const bundle = payload.bundle as Record<string, unknown>;

        if (!cancelled) {
          setParsedBundle(bundle);
          setProjectName(payload.projectName ?? null);
          setAppName(payload.appName ?? null);

          // Run verification
          const vr = await verifyBundle(bundle);
          setResult(vr);
        }
      } catch (err) {
        if (!cancelled) setFetchError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [lookupValue, mode]);

  const handleStampVerify = useCallback(async () => {
    if (!parsedBundle) return;
    setStampVerifying(true);
    const sr = await verifyStamp(parsedBundle);
    setStampResult(sr);
    setStampVerifying(false);
  }, [parsedBundle]);

  const handleDownload = useCallback(() => {
    if (!parsedBundle) return;
    const blob = new Blob([JSON.stringify(parsedBundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cer-record.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [parsedBundle]);

  const stampFields = parsedBundle ? getStampFields(parsedBundle) : null;
  const verificationUrl = getVerificationUrl({
    executionId: executionId ?? null,
    certificateHash: certificateHash ?? result?.recordedHash ?? null,
  });

  const seoTitle = result?.ok
    ? "Verified Record — NexArt"
    : notFound
      ? "Record Not Found — NexArt"
      : "Verify Record — NexArt";

  return (
    <PageLayout>
      <SEOHead
        title={seoTitle}
        description="Public verification of a Certified Execution Record (CER). All verification runs locally in your browser."
      />
      <PageHeader
        title="Verify"
        subtitle={
          notFound
            ? "Record not found."
            : loading
              ? "Loading record…"
              : "Verification runs locally in your browser — no data is sent to any server."
        }
      />

      <PageContent>
        {/* Loading state */}
        {loading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">Loading record…</span>
            </CardContent>
          </Card>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <Card className="border-border">
            <CardContent className="p-8 text-center space-y-3">
              <ShieldQuestion className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No record found for{" "}
                <span className="font-mono text-foreground">
                  {mode === "executionId" ? `execution ID: ${lookupValue}` : `hash: ${lookupValue}`}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                The record may not exist, or it may not have been ingested yet.
              </p>
              <Button variant="outline" size="sm" asChild className="font-mono text-xs">
                <a href="/verify">Verify manually</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <Card className="border-destructive/30 bg-destructive/[0.03]">
            <CardContent className="p-6 space-y-2">
              <p className="text-sm text-destructive font-mono">Failed to load record</p>
              <p className="text-xs text-muted-foreground">{fetchError}</p>
            </CardContent>
          </Card>
        )}

        {/* Decision Receipt — the lightweight summary */}
        {!loading && result && parsedBundle && (
          <DecisionReceipt
            result={result}
            bundle={parsedBundle}
            projectName={projectName}
            appName={appName}
          />
        )}

        {/* Full verification result */}
        {result && (
          <div id="technical-details">
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
                  Technical Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Verdict badge */}
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

                <p className="text-sm text-foreground leading-relaxed">{result.explanation}</p>

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
                    {projectName && <MetaRow label="Project" value={projectName} />}
                    {appName && <MetaRow label="App" value={appName} />}
                  </div>
                )}

                {/* Actions */}
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
                    {verificationUrl && (
                      <button
                        onClick={() => copyText(verificationUrl, "Verification URL", toast)}
                        className="flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-primary transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        Copy verification link
                      </button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleDownload} className="font-mono text-xs">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download record
                    </Button>
                  </div>
                )}

                {/* Stamp status */}
                {stampFields && (
                  <Card className="border border-border bg-muted/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Stamp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                          Stamp Status
                        </span>
                        <Badge variant="outline" className="font-mono text-[10px] ml-auto">
                          {!stampFields.hasStamp ? "Not stamped" : stampFields.isLegacy ? "Legacy" : "Signed"}
                        </Badge>
                      </div>

                      {!stampFields.hasStamp && (
                        <p className="text-xs text-muted-foreground">No attestation stamp is present on this record.</p>
                      )}

                      {stampFields.isLegacy && !stampResult && (
                        <p className="text-xs text-muted-foreground">
                          Stamped (legacy) — not offline-verifiable.
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
                              Verify stamp (offline)
                            </>
                          )}
                        </Button>
                      )}

                      {stampResult && (
                        <div className="flex items-center gap-2 flex-wrap">
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
                    </CardContent>
                  </Card>
                )}

                {/* Technical details */}
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
                    </div>

                    {/* Raw JSON */}
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
          </div>
        )}
      </PageContent>
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
