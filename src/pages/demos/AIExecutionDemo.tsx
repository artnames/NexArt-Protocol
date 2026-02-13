import { useState, useCallback, useId } from "react";
import { createSnapshot, verifySnapshot, sealCer, verifyCer, toCanonicalJson } from "@/lib/ai-execution-browser";
import type { AiExecutionSnapshotV1, CerAiExecutionBundle, VerificationResult } from "@nexart/ai-execution";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Download, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

function generateExecId(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `exec_${hex}`;
}

/** Recursively replace undefined with null in any value. */
function sanitizeDeep<T>(value: T): T {
  if (value === undefined) return null as unknown as T;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sanitizeDeep) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = sanitizeDeep(v);
  }
  return out as T;
}

/** Sanitize demo inputs before feeding to createSnapshot. */
function sanitizeDemoInput(raw: {
  executionId: string;
  provider: string;
  model: string;
  modelVersion: string;
  prompt: string;
  input: string | Record<string, unknown>;
  parameters: { temperature: number; maxTokens: number; topP: string; seed: string };
  output: string | Record<string, unknown>;
  appId: string;
}) {
  return {
    executionId: raw.executionId.trim() || generateExecId(),
    provider: raw.provider.trim() || "openai",
    model: raw.model.trim() || "gpt-4o",
    modelVersion: raw.modelVersion.trim() || null,
    prompt: raw.prompt,
    input: raw.input,
    parameters: {
      temperature: raw.parameters.temperature,
      maxTokens: raw.parameters.maxTokens,
      topP: raw.parameters.topP ? parseFloat(raw.parameters.topP) : null,
      seed: raw.parameters.seed ? parseInt(raw.parameters.seed, 10) : null,
    },
    output: raw.output,
    appId: raw.appId.trim() || null,
  };
}

interface AttestationCheck {
  ready: boolean;
  issues: string[];
}

/** Evaluate whether a bundle is attestation-ready. */
function checkAttestationReadiness(bundle: CerAiExecutionBundle): AttestationCheck {
  const issues: string[] = [];
  const s = bundle.snapshot;

  // Check for undefined anywhere (post-sanitize this shouldn't happen)
  const json = JSON.stringify(bundle);
  // JSON.stringify drops undefined, so check the raw object
  function findUndefined(obj: unknown, path: string) {
    if (obj === undefined) { issues.push(`Found undefined at ${path}`); return; }
    if (obj === null || typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      findUndefined(v, `${path}.${k}`);
    }
  }
  findUndefined(bundle, "bundle");

  if (!s.provider || typeof s.provider !== "string") issues.push("Missing provider");
  if (!s.model || typeof s.model !== "string") issues.push("Missing model");
  if (!s.executionId) issues.push("Missing executionId");
  if (!s.prompt) issues.push("Missing prompt");
  if (typeof s.parameters?.temperature !== "number" || !Number.isFinite(s.parameters.temperature))
    issues.push("Invalid parameters.temperature");
  if (typeof s.parameters?.maxTokens !== "number" || !Number.isFinite(s.parameters.maxTokens))
    issues.push("Invalid parameters.maxTokens");

  // Ensure all parameter keys exist
  for (const key of ["temperature", "maxTokens", "topP", "seed"] as const) {
    if (!(key in s.parameters)) issues.push(`Missing parameters.${key}`);
  }

  return { ready: issues.length === 0, issues };
}

const AIExecutionDemo = () => {
  // Form state
  const [executionId, setExecutionId] = useState(generateExecId);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o");
  const [modelVersion, setModelVersion] = useState("");
  const [prompt, setPrompt] = useState("You are a helpful assistant.");
  const [inputText, setInputText] = useState("Summarize the key risks in Q4 earnings.");
  const [inputIsJson, setInputIsJson] = useState(false);
  const [temperature, setTemperature] = useState("0");
  const [maxTokens, setMaxTokens] = useState("1024");
  const [topP, setTopP] = useState("");
  const [seed, setSeed] = useState("");
  const [outputText, setOutputText] = useState("Key risks identified: (1) Revenue contraction of 12% YoY, (2) Margin pressure from increased operating costs, (3) Regulatory uncertainty in EU markets.");
  const [outputIsJson, setOutputIsJson] = useState(false);
  const [appId, setAppId] = useState("nexart.io-demo");

  // Results state
  const [snapshot, setSnapshot] = useState<AiExecutionSnapshotV1 | null>(null);
  const [bundle, setBundle] = useState<CerAiExecutionBundle | null>(null);
  const [snapshotResult, setSnapshotResult] = useState<VerificationResult | null>(null);
  const [cerResult, setCerResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tamper state
  const [tampered, setTampered] = useState(false);
  const [tamperResult, setTamperResult] = useState<VerificationResult | null>(null);

  const parseJsonSafe = (text: string): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) return parsed;
      return null;
    } catch {
      return null;
    }
  };

  // Attestation readiness state
  const [attestation, setAttestation] = useState<AttestationCheck | null>(null);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setTampered(false);
    setTamperResult(null);
    setAttestation(null);

    // Parse input
    let inputValue: string | Record<string, unknown>;
    if (inputIsJson) {
      const parsed = parseJsonSafe(inputText);
      if (!parsed) { setError("Input is not valid JSON. Disable JSON mode or fix the syntax."); return; }
      inputValue = parsed;
    } else {
      inputValue = inputText;
    }

    // Parse output
    let outputValue: string | Record<string, unknown>;
    if (outputIsJson) {
      const parsed = parseJsonSafe(outputText);
      if (!parsed) { setError("Output is not valid JSON. Disable JSON mode or fix the syntax."); return; }
      outputValue = parsed;
    } else {
      outputValue = outputText;
    }

    const temp = parseFloat(temperature);
    const mt = parseInt(maxTokens, 10);
    if (isNaN(temp) || isNaN(mt)) { setError("Temperature and Max Tokens must be valid numbers."); return; }

    try {
      const sanitized = sanitizeDemoInput({
        executionId, provider, model, modelVersion, prompt,
        input: inputValue, output: outputValue, appId,
        parameters: { temperature: temp, maxTokens: mt, topP, seed },
      });

      const snap = sanitizeDeep(await createSnapshot(sanitized));
      const sr = await verifySnapshot(snap);
      const bnd = sanitizeDeep(await sealCer(snap, { meta: { source: "nexart.io", tags: ["demo"] } }));
      const cr = await verifyCer(bnd);

      setSnapshot(snap);
      setBundle(bnd);
      setSnapshotResult(sr);
      setCerResult(cr);
      setAttestation(checkAttestationReadiness(bnd));
    } catch (e: any) {
      setError(e.message || "Failed to generate snapshot.");
    }
  }, [executionId, provider, model, modelVersion, prompt, inputText, inputIsJson, temperature, maxTokens, topP, seed, outputText, outputIsJson, appId]);

  const handleTamperToggle = useCallback((checked: boolean) => {
    setTampered(checked);
    setTamperResult(null);
    if (!checked) return;
    // Tamper will be applied on re-verify
  }, []);

  const handleReverify = useCallback(async () => {
    if (!bundle) return;
    if (tampered) {
      const tamperedBundle = JSON.parse(JSON.stringify(bundle)) as CerAiExecutionBundle;
      if (typeof tamperedBundle.snapshot.output === "string") {
        tamperedBundle.snapshot.output = tamperedBundle.snapshot.output.slice(0, -1) + "X";
      } else {
        tamperedBundle.snapshot.output = { ...tamperedBundle.snapshot.output, _tampered: true };
      }
      const result = await verifyCer(tamperedBundle);
      setTamperResult(result);
    } else {
      const result = await verifyCer(bundle);
      setTamperResult(result);
    }
  }, [bundle, tampered]);

  const handleDownload = useCallback(() => {
    if (!bundle) return;
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cer-${bundle.snapshot.executionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bundle]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const VerifyBadge = ({ label, result }: { label: string; result: VerificationResult | null }) => {
    if (!result) return null;
    return (
      <div className="flex items-center gap-2">
        {result.ok ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
        <span className="text-sm font-mono">
          {label}: <strong>{result.ok ? "PASS" : "FAIL"}</strong>
        </span>
        {!result.ok && result.errors.length > 0 && (
          <span className="text-xs text-destructive ml-1">— {result.errors[0]}</span>
        )}
      </div>
    );
  };

  const fieldId = useId();

  return (
    <PageLayout>
      <SEOHead
        title="AI Execution Integrity Demo"
        description="Create an audit-ready record of an AI run: inputs, parameters, outputs, and cryptographic hashes — sealed into a Certified Execution Record (CER)."
      />

      <PageHeader
        title="AI Execution Integrity Demo"
        subtitle="Create an audit-ready record of an AI run: inputs, parameters, outputs, and cryptographic hashes — sealed into a Certified Execution Record (CER)."
      />

      <PageContent>
        <div className="prose-protocol">
          {/* Section 1: Form */}
          <section>
            <h2>1. Enter an Example AI Run</h2>
            <p>Enter an example AI interaction to generate a CER. No provider calls are made — this demo runs locally and shows how integrity records are formed and verified.</p>

            <div className="space-y-5 mt-6">
              {/* executionId */}
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-execid`} className="text-sm font-mono">executionId</Label>
                <Input id={`${fieldId}-execid`} value={executionId} onChange={(e) => setExecutionId(e.target.value)} className="font-mono text-sm" />
              </div>

              {/* provider + model row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-mono">provider</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger className="font-mono text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      <SelectItem value="openai">openai</SelectItem>
                      <SelectItem value="anthropic">anthropic</SelectItem>
                      <SelectItem value="other">other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-model`} className="text-sm font-mono">model</Label>
                  <Input id={`${fieldId}-model`} value={model} onChange={(e) => setModel(e.target.value)} className="font-mono text-sm" />
                </div>
              </div>

              {/* modelVersion */}
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-mv`} className="text-sm font-mono">modelVersion <span className="text-caption">(optional)</span></Label>
                <Input id={`${fieldId}-mv`} value={modelVersion} onChange={(e) => setModelVersion(e.target.value)} placeholder="e.g. 2026-01-01" className="font-mono text-sm" />
              </div>

              {/* prompt */}
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-prompt`} className="text-sm font-mono">prompt</Label>
                <Textarea id={`${fieldId}-prompt`} value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} className="font-mono text-sm" />
              </div>

              {/* input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${fieldId}-input`} className="text-sm font-mono">input</Label>
                  <div className="flex items-center gap-2 text-xs text-caption">
                    <span>Text</span>
                    <Switch checked={inputIsJson} onCheckedChange={setInputIsJson} />
                    <span>JSON</span>
                  </div>
                </div>
                <Textarea id={`${fieldId}-input`} value={inputText} onChange={(e) => setInputText(e.target.value)} rows={3} className="font-mono text-sm" />
              </div>

              {/* parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-temp`} className="text-sm font-mono">temperature</Label>
                  <Input id={`${fieldId}-temp`} type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-mt`} className="text-sm font-mono">maxTokens</Label>
                  <Input id={`${fieldId}-mt`} type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className="font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-tp`} className="text-sm font-mono">topP <span className="text-caption text-xs">(opt)</span></Label>
                  <Input id={`${fieldId}-tp`} type="number" step="0.1" value={topP} onChange={(e) => setTopP(e.target.value)} placeholder="null" className="font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-seed`} className="text-sm font-mono">seed <span className="text-caption text-xs">(opt)</span></Label>
                  <Input id={`${fieldId}-seed`} type="number" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="null" className="font-mono text-sm" />
                </div>
              </div>

              {/* output */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${fieldId}-output`} className="text-sm font-mono">output</Label>
                  <div className="flex items-center gap-2 text-xs text-caption">
                    <span>Text</span>
                    <Switch checked={outputIsJson} onCheckedChange={setOutputIsJson} />
                    <span>JSON</span>
                  </div>
                </div>
                <Textarea id={`${fieldId}-output`} value={outputText} onChange={(e) => setOutputText(e.target.value)} rows={3} className="font-mono text-sm" />
              </div>

              {/* appId */}
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-appid`} className="text-sm font-mono">appId</Label>
                <Input id={`${fieldId}-appid`} value={appId} onChange={(e) => setAppId(e.target.value)} className="font-mono text-sm" />
              </div>
            </div>
          </section>

          {/* Section 2: Generate */}
          <section className="mt-12">
            <h2>2. Generate Record</h2>
            <p>
              Generates a canonical snapshot, seals it into a CER, and verifies both. Verification checks that the hashes match exactly and that the certificate hash was computed correctly. All operations happen in your browser using{" "}
              <code>@nexart/ai-execution</code>.
            </p>

            {error && (
              <div className="border border-destructive/40 bg-destructive/5 rounded-sm px-4 py-3 text-sm text-destructive mb-4">
                {error}
              </div>
            )}

            <Button onClick={handleGenerate} className="mt-2">
              Generate Snapshot + CER
            </Button>
          </section>

          {/* Section 3: Results */}
          {snapshot && bundle && (
            <section className="mt-12">
              <h2>3. Results</h2>

              <div className="space-y-4 mt-4">
                {/* Hash cards */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="border border-border rounded-sm p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-mono text-caption uppercase tracking-wider">Input Hash</p>
                      <button onClick={() => copyToClipboard(snapshot.inputHash)} className="p-1 rounded hover:bg-muted transition-colors" title="Copy Input Hash">
                        <Copy className="h-3 w-3 text-caption" />
                      </button>
                    </div>
                    <p className="text-sm font-mono break-all">{snapshot.inputHash}</p>
                  </div>
                  <div className="border border-border rounded-sm p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-mono text-caption uppercase tracking-wider">Output Hash</p>
                      <button onClick={() => copyToClipboard(snapshot.outputHash)} className="p-1 rounded hover:bg-muted transition-colors" title="Copy Output Hash">
                        <Copy className="h-3 w-3 text-caption" />
                      </button>
                    </div>
                    <p className="text-sm font-mono break-all">{snapshot.outputHash}</p>
                  </div>
                  <div className="border border-border rounded-sm p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-mono text-caption uppercase tracking-wider">Certificate Hash</p>
                      <button onClick={() => copyToClipboard(bundle.certificateHash)} className="p-1 rounded hover:bg-muted transition-colors" title="Copy Certificate Hash">
                        <Copy className="h-3 w-3 text-caption" />
                      </button>
                    </div>
                    <p className="text-sm font-mono break-all">{bundle.certificateHash}</p>
                  </div>
                  <p className="text-xs text-caption font-mono mt-1">Hash format: sha256: — Certificate hash excludes meta fields (by design).</p>
                </div>

                {/* Verification badges */}
                <div className="border border-border rounded-sm p-4 space-y-3">
                  <VerifyBadge label="Snapshot integrity" result={snapshotResult} />
                  <VerifyBadge label="Certificate integrity" result={cerResult} />
                  {attestation && (
                    <div className="flex items-start gap-2 mt-1">
                      {attestation.ready ? (
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                      )}
                      <div>
                        <span className="text-sm font-mono">
                          Attestation-ready: <strong>{attestation.ready ? "YES" : "NO"}</strong>
                        </span>
                        {!attestation.ready && attestation.issues.length > 0 && (
                          <ul className="text-xs text-destructive mt-1 list-disc list-inside">
                            {attestation.issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-caption mt-2">
                    Integrity status reflects whether the record is internally consistent. PASS means the snapshot hashes match the recorded values and the certificate hash matches the sealed payload. FAIL means one or more fields no longer match their expected hashes (possible tampering or corruption). ERROR indicates verification could not be completed due to missing fields or invalid formatting.
                  </p>
                </div>

                {/* Download */}
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1.5" />
                      Download CER (.json)
                    </Button>
                  </div>
                  <p className="text-xs text-caption font-mono">
                    Downloads the exact certified bundle. Optional fields are normalized to null (never undefined) for canonical hashing.
                  </p>
                </div>

                {/* Canonical JSON accordion */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="snapshot-json">
                    <AccordionTrigger className="text-sm font-mono">Canonical snapshot (audit payload)</AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <button
                          onClick={() => copyToClipboard(toCanonicalJson(snapshot))}
                          className="absolute top-2 right-2 p-1.5 rounded hover:bg-muted transition-colors"
                          title="Copy JSON"
                        >
                          <Copy className="h-3.5 w-3.5 text-caption" />
                        </button>
                        <pre className="bg-muted/50 border border-border rounded-sm p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                          {toCanonicalJson(snapshot)}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="bundle-json">
                    <AccordionTrigger className="text-sm font-mono">Full CER Bundle JSON</AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(bundle, null, 2))}
                          className="absolute top-2 right-2 p-1.5 rounded hover:bg-muted transition-colors"
                          title="Copy JSON"
                        >
                          <Copy className="h-3.5 w-3.5 text-caption" />
                        </button>
                        <pre className="bg-muted/50 border border-border rounded-sm p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(bundle, null, 2)}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          )}

          {/* Section 4: Tamper Check */}
          {bundle && (
            <section className="mt-12">
              <h2>4. Tamper Check</h2>
              <p>
                Simulate evidence tampering. This modifies one character in memory and re-runs verification to demonstrate detection.
              </p>

              <div className="border border-border rounded-sm p-4 mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Switch checked={tampered} onCheckedChange={handleTamperToggle} />
                  <span className="text-sm font-mono">Tamper with record (demo)</span>
                </div>

                <Button variant="outline" onClick={handleReverify}>
                  Re-verify
                </Button>

                {tamperResult && (
                  <div className={`border rounded-sm p-4 ${tamperResult.ok ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5"}`}>
                    <VerifyBadge label="CER Verified" result={tamperResult} />
                    {!tamperResult.ok && (
                      <p className="text-sm text-destructive mt-2 font-mono">
                        FAIL: Integrity breach detected — the record no longer matches its hashes.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Section 5: What this proves */}
          <section className="mt-12">
            <h2>What This Proves (Plain English)</h2>
            <p>
              This does not guarantee the model would produce the same output again. It guarantees that this recorded output is cryptographically bound to the recorded inputs and parameters. If any field is altered — even by one character — verification fails.
            </p>
          </section>

          {/* Section 6: Links */}
          <section className="mt-12 pt-8 border-t border-border">
            <h2>Links</h2>
            <ul>
              <li>
                <a href="https://www.npmjs.com/package/@nexart/ai-execution" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground inline-flex items-center gap-1">
                  NPM: @nexart/ai-execution <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a href="https://github.com/artnames/nexart-ai-execution" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground inline-flex items-center gap-1">
                  GitHub: nexart-ai-execution <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <Link to="/protocol/ai-execution-integrity" className="text-body underline underline-offset-2 hover:text-foreground">
                  Protocol: AI Execution Integrity (Draft)
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default AIExecutionDemo;
