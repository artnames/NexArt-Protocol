import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const AIExecutionCertification = () => {
  return (
    <PageLayout>
      <SEOHead
        title="AI Execution Certification | NexArt"
        description="Step-by-step guide to certifying AI/LLM execution records with tamper-evident CER bundles and node attestation."
      />

      <PageHeader
        title="AI Execution Certification"
        subtitle="I call an LLM — how do I certify that record?"
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* On-page navigation */}
          <nav className="mb-10 pb-6 border-b border-border">
            <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">On this page</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm list-none pl-0">
              <li><a href="#minimum-integration" className="text-body underline underline-offset-2 hover:text-foreground">Minimum Integration</a></li>
              <li><a href="#certify-decision" className="text-body underline underline-offset-2 hover:text-foreground">certifyDecision</a></li>
              <li><a href="#certify-and-attest" className="text-body underline underline-offset-2 hover:text-foreground">certifyAndAttestDecision</a></li>
              <li><a href="#verify" className="text-body underline underline-offset-2 hover:text-foreground">Verify</a></li>
              <li><a href="#what-this-certifies" className="text-body underline underline-offset-2 hover:text-foreground">What This Certifies</a></li>
              <li><a href="#redaction" className="text-body underline underline-offset-2 hover:text-foreground">Redaction</a></li>
              <li><a href="#multi-step" className="text-body underline underline-offset-2 hover:text-foreground">Multi-Step Workflows</a></li>
              <li><a href="#try-it" className="text-body underline underline-offset-2 hover:text-foreground">Try It</a></li>
            </ul>
          </nav>

          {/* Minimum integration box */}
          <section id="minimum-integration">
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">Minimum Integration — 3 Steps</p>
              <ol className="text-sm text-body space-y-2 pl-5 mb-0">
                <li><strong><code>certifyDecision()</code></strong> — Seal input, output, and parameters into a CER bundle.</li>
                <li><strong><code>certifyAndAttestDecision()</code></strong> — Same as above, plus submit to a node for a signed receipt.</li>
                <li><strong>Verify</strong> — <code>verify(bundle)</code> for local integrity; <code>verifyBundleAttestation(bundle, &#123; nodeUrl &#125;)</code> if a signed receipt is present.</li>
              </ol>
            </div>
          </section>

          {/* Step 1: certifyDecision */}
          <section id="certify-decision">
            <h2>Step 1 — certifyDecision()</h2>
            <p>
              The simplest path. Pass your LLM call details and get a sealed CER bundle in one call.
            </p>

            <div className="spec-code">
              <code>
{`import { certifyDecision } from '@nexart/ai-execution';

const cer = certifyDecision({
  provider: 'openai',
  model: 'gpt-4o',
  prompt: 'Summarize the document.',
  input: userQuery,
  output: llmResponse,
  parameters: {
    temperature: 0.7,
    maxTokens: 1024,
    topP: null,
    seed: null,
  },
});

console.log(cer.certificateHash);
// "sha256:a1b2c3..."

console.log(cer.bundleType);
// "cer.ai.execution.v1"`}
              </code>
            </div>

            <p>
              The <code>certificateHash</code> is a SHA-256 digest of the canonical JSON of <code>&#123; bundleType, version, createdAt, snapshot &#125;</code>.
              Any post-hoc change to the input, output, or parameters invalidates it.
            </p>
          </section>

          {/* Step 2: certifyAndAttestDecision */}
          <section id="certify-and-attest">
            <h2>Step 2 — certifyAndAttestDecision()</h2>
            <p>
              One-call integration: certifies the decision and submits it to a canonical node for a signed receipt.
            </p>

            <div className="spec-code">
              <code>
{`import { certifyAndAttestDecision } from '@nexart/ai-execution';

const { bundle, receipt } = await certifyAndAttestDecision(
  {
    provider: 'openai',
    model: 'gpt-4o',
    prompt: 'Classify sentiment.',
    input: customerMessage,
    output: sentimentResult,
    parameters: { temperature: 0, maxTokens: 64, topP: null, seed: null },
  },
  {
    nodeUrl: 'https://nexart-canonical-renderer-production.up.railway.app',
    apiKey: process.env.NEXART_API_KEY,
  }
);

console.log(receipt.attestationId);
// "att-xyz789..."
console.log(receipt.signatureB64Url);
// Ed25519 signature`}
              </code>
            </div>

            <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
              <p className="text-sm text-muted-foreground mb-0">
                <strong>Skip re-attestation:</strong> Use <code>attestIfNeeded(bundle, options)</code> to avoid
                double-attestation. It checks for an existing receipt before making a network call.
              </p>
            </div>
          </section>

          {/* Step 3: Verify */}
          <section id="verify">
            <h2>Step 3 — Verify</h2>
            <p>
              Verification works in two layers:
            </p>

            <div className="spec-code">
              <code>
{`import { verify, verifyBundleAttestation } from '@nexart/ai-execution';

// 1. Local integrity — checks certificate hash, input/output hashes
const result = verify(bundle);
console.log(result.ok);   // true
console.log(result.code); // "OK"

// 2. Node stamp — verifies Ed25519 signed receipt (if present)
const stamp = await verifyBundleAttestation(bundle, {
  nodeUrl: 'https://nexart-canonical-renderer-production.up.railway.app',
});
console.log(stamp.ok);   // true
console.log(stamp.code); // "OK"`}
              </code>
            </div>
          </section>

          {/* What this certifies */}
          <section id="what-this-certifies">
            <h2>What This Certifies</h2>
            <div className="spec-warning">
              <p className="text-sm text-body mb-0">
                <strong>Integrity, not determinism.</strong> A CER certifies that the recorded input, output, and
                parameters have not been modified after the fact. It does <em>not</em> guarantee that the AI model will
                produce the same output again — LLMs are not deterministic. It also does not verify provider identity.
              </p>
            </div>
            <ul>
              <li><strong>PASS</strong> — The record is internally consistent. Hashes match the sealed payload.</li>
              <li><strong>FAIL</strong> — Integrity breach. The record does not match its hashes.</li>
              <li><strong>ERROR</strong> — Missing fields or invalid formatting.</li>
            </ul>
          </section>

          {/* Redaction */}
          <section id="redaction">
            <h2>Redaction Guidance</h2>
            <p>
              You may need to redact sensitive fields (PII, proprietary prompts) before storing or sharing a CER bundle.
            </p>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Effect on Verification</th>
                    <th>Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Delete the key</td>
                    <td>Hash mismatch (expected)</td>
                    <td>✅ Yes</td>
                  </tr>
                  <tr>
                    <td>Set to <code>null</code></td>
                    <td>Hash mismatch (expected)</td>
                    <td>✅ Yes</td>
                  </tr>
                  <tr>
                    <td>Set to <code>undefined</code></td>
                    <td>Breaks canonical JSON</td>
                    <td>❌ Never</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Use <code>sanitizeForAttestation(bundle)</code> before archiving — it removes <code>undefined</code> values and rejects non-serializable types.
            </p>
          </section>

          {/* Multi-step */}
          <section id="multi-step">
            <h2>Multi-Step Workflows</h2>
            <p>
              For agentic pipelines with multiple LLM calls, use <code>RunBuilder</code> to chain steps with <code>prevStepHash</code> linking:
            </p>

            <div className="spec-code">
              <code>
{`import { RunBuilder } from '@nexart/ai-execution';

const run = new RunBuilder({
  runId: 'analysis-run',
  workflowId: 'data-pipeline',
});

run.step({
  provider: 'openai',
  model: 'gpt-4o',
  prompt: 'Plan the analysis.',
  input: 'Analyze Q1 sales data.',
  output: 'I will: 1) load data, 2) compute totals, 3) summarize.',
  parameters: { temperature: 0.3, maxTokens: 512, topP: null, seed: null },
});

run.step({
  provider: 'openai',
  model: 'gpt-4o',
  prompt: 'Execute step 1.',
  input: 'Load and total Q1 data.',
  output: 'Total revenue: $1.2M.',
  parameters: { temperature: 0.3, maxTokens: 512, topP: null, seed: null },
});

const summary = run.finalize();
// { runId, stepCount: 2, steps: [...], finalStepHash: "sha256:..." }`}
              </code>
            </div>
          </section>

          {/* Try it */}
          <section id="try-it">
            <h2>Try It</h2>
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <p className="text-sm text-body mb-3">
                <strong>Issue → Verify → Audit:</strong>
              </p>
              <ol className="text-sm text-body space-y-2 pl-5 mb-4">
                <li>Issue an AI CER at{" "}
                  <a href="https://nexartaiauditor.xyz" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground">nexartaiauditor.xyz</a>
                </li>
                <li>Download the CER JSON</li>
                <li>Verify independently at{" "}
                  <a href="https://recanon.xyz" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground">recanon.xyz</a>
                  {" "}— upload the JSON to audit integrity
                </li>
              </ol>
            </div>
          </section>

          {/* Next steps */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/docs/certification/verify"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              Verify Independently →
            </Link>
            <Link
              to="/docs/certification/node-stamps"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              Node Stamps & Keys →
            </Link>
          </div>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default AIExecutionCertification;
