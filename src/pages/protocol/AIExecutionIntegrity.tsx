import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";

const AIExecutionIntegrity = () => {
  return (
    <PageLayout>
      <SEOHead
        title="AI Execution Integrity | NexArt"
        description="Execution surface ai.execution.v1 — tamper-evident records for AI and LLM runs. Certify integrity with CER bundles, node attestation, and signed receipt verification."
      />

      <PageHeader
        title="AI Execution Integrity"
        subtitle="Tamper-evident records for AI and LLM executions."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* Version metadata */}
          <div className="flex flex-wrap gap-3 mb-10">
            <span className="inline-block text-xs font-mono px-2.5 py-1 border border-border rounded bg-muted/40 text-caption">
              Surface: ai.execution.v1
            </span>
            <span className="inline-block text-xs font-mono px-2.5 py-1 border border-border rounded bg-muted/40 text-caption">
              CER: cer.ai.execution.v1
            </span>
            <span className="inline-block text-xs font-mono px-2.5 py-1 border border-border rounded bg-muted/40 text-caption">
              Protocol: NexArt v1.2.0
            </span>
            <span className="inline-block text-xs font-mono px-2.5 py-1 border border-border rounded bg-muted/40 text-caption">
              SDK: @nexart/ai-execution v0.6.0
            </span>
          </div>

          {/* On-page navigation */}
          <nav className="mb-10 pb-6 border-b border-border">
            <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">On this page</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm list-none pl-0">
              <li><a href="#minimum-integration" className="text-body underline underline-offset-2 hover:text-foreground">Minimum Integration</a></li>
              <li><a href="#overview" className="text-body underline underline-offset-2 hover:text-foreground">Overview</a></li>
              <li><a href="#cer-bundle-format" className="text-body underline underline-offset-2 hover:text-foreground">CER Bundle Format</a></li>
              <li><a href="#snapshot-format" className="text-body underline underline-offset-2 hover:text-foreground">Snapshot Format</a></li>
              <li><a href="#hashing-rules" className="text-body underline underline-offset-2 hover:text-foreground">Hashing Rules</a></li>
              <li><a href="#node-attestation" className="text-body underline underline-offset-2 hover:text-foreground">Node Attestation</a></li>
              <li><a href="#reason-codes" className="text-body underline underline-offset-2 hover:text-foreground">Reason Codes</a></li>
              <li><a href="#try-it" className="text-body underline underline-offset-2 hover:text-foreground">Try It</a></li>
            </ul>
          </nav>

          {/* ── Minimum Integration ── */}
          <section id="minimum-integration">
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">Minimum Integration — 3 Steps</p>
              <ol className="text-sm text-body space-y-2 pl-5 mb-0">
                <li><strong>Create a CER bundle</strong> — <code>certifyDecision()</code> or <code>createSnapshot()</code> + <code>sealCer()</code>.</li>
                <li><strong>Optional node attestation</strong> — <code>certifyAndAttestDecision()</code> or <code>attest()</code> for a signed receipt.</li>
                <li><strong>Verify</strong> — Local: <code>verify(bundle)</code>. Offline node stamp: <code>verifyBundleAttestation(bundle, &#123; nodeUrl &#125;)</code> (if signed receipt present).</li>
              </ol>
            </div>

            <h3 className="mt-8">Step 1 — Create a CER bundle</h3>
            <div className="spec-code">
              <code>
{`import { certifyDecision } from '@nexart/ai-execution';

const cer = certifyDecision({
  provider: 'openai',
  model: 'gpt-4o',
  prompt: 'Summarize.',
  input: userQuery,
  output: llmResponse,
  parameters: { temperature: 0.7, maxTokens: 1024, topP: null, seed: null },
});

console.log(cer.certificateHash); // "sha256:..."`}
              </code>
            </div>

            <h3 className="mt-8">Step 2 — Node attestation (optional)</h3>
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
    apiKey: process.env.NEXART_NODE_API_KEY,
  }
);

console.log(receipt.attestationId);   // "att-xyz..."
console.log(receipt.signatureB64Url); // Ed25519 signature`}
              </code>
            </div>

            <h3 className="mt-8">Step 3 — Verify</h3>
            <div className="spec-code">
              <code>
{`import { verify, verifyBundleAttestation } from '@nexart/ai-execution';

// Local integrity
const result = verify(bundle);
console.log(result.ok);   // true
console.log(result.code); // "OK"

// Offline node stamp (if signed receipt present)
const stamp = await verifyBundleAttestation(bundle, {
  nodeUrl: 'https://nexart-canonical-renderer-production.up.railway.app',
});
console.log(stamp.ok);   // true
console.log(stamp.code); // "OK"`}
              </code>
            </div>
          </section>

          {/* ── Overview ── */}
          <section id="overview" className="mt-12">
            <h2>Overview</h2>
            <p>
              AI Execution Integrity is an execution surface built on{" "}
              <Link to="/protocol" className="text-body underline underline-offset-2 hover:text-foreground">
                NexArt Protocol v1.2.0
              </Link>
              . It standardizes how AI and LLM runs are captured, sealed, and audited.
            </p>
            <p>
              Every time you call an AI model, the SDK captures what you sent, what you got back, and the exact
              parameters used. It computes SHA-256 hashes of everything and seals the record into a Certified Execution
              Record (CER). Any post-hoc modification invalidates the certificate hash.
            </p>

            <h3 className="mt-8">What this certifies</h3>
            <ul>
              <li><strong>Integrity of the recorded execution</strong> — cryptographic binding between inputs, parameters, and outputs</li>
              <li><strong>Tamper evidence</strong> — any modification to the record is detectable</li>
              <li><strong>Chain of custody</strong> — optional node attestation provides third-party proof</li>
            </ul>

            <h3 className="mt-8">What this does not certify</h3>
            <ul>
              <li><strong>Determinism</strong> — LLMs are not deterministic. Re-running the same prompt may produce different outputs.</li>
              <li><strong>Provider identity</strong> — the record does not verify that the stated provider actually ran the model.</li>
              <li><strong>Output correctness</strong> — integrity attestation does not guarantee truthfulness or quality.</li>
            </ul>
          </section>

          {/* ── CER Bundle Format ── */}
          <section id="cer-bundle-format" className="mt-12">
            <h2>CER Bundle Format</h2>
            <p>
              A Certified Execution Record wraps a snapshot into a verifiable envelope:
            </p>
            <pre className="bg-muted/50 border border-border rounded-sm p-4 text-sm font-mono overflow-x-auto mt-4">
{`{
  "bundleType": "cer.ai.execution.v1",
  "certificateHash": "sha256:...",
  "createdAt": "2026-02-12T00:00:00.000Z",
  "version": "0.1",
  "snapshot": { ... },
  "meta": { "source": "my-app", "tags": ["production"] }
}`}
            </pre>

            <h3 className="mt-6">Certificate hash computation</h3>
            <p>
              The <code>certificateHash</code> is SHA-256 of the UTF-8 bytes of the canonical JSON of exactly four fields:
            </p>
            <div className="spec-code">
              <code>
{`sha256(canonicalJson({ bundleType, version, createdAt, snapshot }))`}
              </code>
            </div>
            <p>
              Everything else is <strong>excluded</strong> from the certificate hash, regardless of where it appears in the bundle:
            </p>
            <ul>
              <li><code>meta</code> — excluded (user metadata, tags, etc.)</li>
              <li><code>receipt</code>, <code>signature</code>, <code>attestorKeyId</code> — excluded (attestation fields)</li>
              <li><code>attestationId</code>, <code>nodeRuntimeHash</code> — excluded (legacy attestation fields)</li>
              <li>Any other top-level or nested attestation data — excluded</li>
            </ul>
            <p>
              Key ordering is recursive (canonical JSON). This computation is identical across all SDK versions.</p>
          </section>

          {/* ── Snapshot Format ── */}
          <section id="snapshot-format" className="mt-12">
            <h2>Snapshot Format (ai.execution.v1)</h2>

            <h3 className="mt-6">Required core fields</h3>
            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>executionId</code></td><td><code>string</code></td><td>Caller-supplied unique ID</td></tr>
                  <tr><td><code>provider</code></td><td><code>string</code></td><td>e.g. "openai", "anthropic"</td></tr>
                  <tr><td><code>model</code></td><td><code>string</code></td><td>e.g. "gpt-4o"</td></tr>
                  <tr><td><code>prompt</code></td><td><code>string</code></td><td>System prompt</td></tr>
                  <tr><td><code>input</code></td><td><code>string | object</code></td><td>User input</td></tr>
                  <tr><td><code>output</code></td><td><code>string | object</code></td><td>Model output</td></tr>
                  <tr><td><code>parameters.temperature</code></td><td><code>number</code></td><td>Must be finite</td></tr>
                  <tr><td><code>parameters.maxTokens</code></td><td><code>number</code></td><td>Must be finite</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6">Optional fields</h3>
            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>timestamp</code></td><td><code>string</code></td><td>ISO 8601; defaults to <code>now()</code></td></tr>
                  <tr><td><code>modelVersion</code></td><td><code>string | null</code></td><td><code>null</code></td></tr>
                  <tr><td><code>parameters.topP</code></td><td><code>number | null</code></td><td><code>null</code></td></tr>
                  <tr><td><code>parameters.seed</code></td><td><code>number | null</code></td><td><code>null</code></td></tr>
                  <tr><td><code>sdkVersion</code></td><td><code>string | null</code></td><td><code>null</code></td></tr>
                  <tr><td><code>appId</code></td><td><code>string | null</code></td><td><code>null</code></td></tr>
                  <tr><td><code>runId</code></td><td><code>string | null</code></td><td>Workflow run ID</td></tr>
                  <tr><td><code>stepId</code></td><td><code>string | null</code></td><td>Step identifier within a run</td></tr>
                  <tr><td><code>stepIndex</code></td><td><code>number | null</code></td><td>0-based step position</td></tr>
                  <tr><td><code>workflowId</code></td><td><code>string | null</code></td><td>Workflow template ID</td></tr>
                  <tr><td><code>conversationId</code></td><td><code>string | null</code></td><td>Conversation/session ID</td></tr>
                  <tr><td><code>prevStepHash</code></td><td><code>string | null</code></td><td>certificateHash of previous step</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6">Redaction and sanitization</h3>
            <p>
              You may need to redact sensitive fields (PII, proprietary prompts) before storing or sharing a CER.
            </p>
            <ul>
              <li><strong>Delete the key</strong> — safe. Hash will no longer match (expected for redacted records).</li>
              <li><strong>Set to <code>null</code></strong> — safe. Hash will no longer match (expected).</li>
              <li><strong>Never set to <code>undefined</code></strong> — <code>undefined</code> is not valid JSON and will break canonical serialization.</li>
            </ul>
            <p>
              Before archiving or attesting, call <code>sanitizeForAttestation(bundle)</code> to strip any <code>undefined</code> values
              and reject non-serializable types (BigInt, functions, symbols):
            </p>
            <div className="spec-code">
              <code>
{`import { sanitizeForAttestation } from '@nexart/ai-execution';

// Deep-clones the bundle, removes undefined keys, rejects BigInt/functions
const clean = sanitizeForAttestation(bundle);`}
              </code>
            </div>

            <h3 className="mt-6">Auto-generated fields</h3>
            <p>
              These are set by <code>createSnapshot()</code> — do not set them manually:
            </p>
            <ul>
              <li><code>type</code> — always <code>"ai.execution.v1"</code></li>
              <li><code>protocolVersion</code> — always <code>"1.2.0"</code></li>
              <li><code>executionSurface</code> — always <code>"ai"</code></li>
              <li><code>inputHash</code> — SHA-256 of input (strings: raw UTF-8 bytes; objects: canonical JSON bytes)</li>
              <li><code>outputHash</code> — SHA-256 of output (strings: raw UTF-8 bytes; objects: canonical JSON bytes)</li>
            </ul>
          </section>

          {/* ── Hashing Rules ── */}
          <section id="hashing-rules" className="mt-12">
            <h2>Canonical Hashing Rules</h2>

            <h3 className="mt-6">inputHash / outputHash</h3>
            <ul>
              <li><strong>String values</strong> — hashed as raw UTF-8 byte sequences (no canonicalization needed)</li>
              <li><strong>Object values</strong> — serialized to canonical JSON first, then hashed as UTF-8 bytes</li>
            </ul>

            <div className="spec-code">
              <code>
{`// String input → hash raw UTF-8 bytes
inputHash = "sha256:" + sha256(utf8Bytes("What is 2+2?"))

// Object input → canonicalize first, then hash
inputHash = "sha256:" + sha256(utf8Bytes(canonicalJson({ locale: "en-US", text: "Hello" })))`}
              </code>
            </div>

            <h3 className="mt-6">Canonical JSON rules</h3>
            <ul>
              <li>Keys sorted lexicographically (Unicode codepoint order) at every nesting level</li>
              <li>No whitespace between tokens</li>
              <li>Array order preserved</li>
              <li><code>null</code> serialized as <code>null</code></li>
              <li>Numbers must be finite — <code>NaN</code>, <code>Infinity</code>, <code>-Infinity</code> rejected (throw)</li>
              <li><code>undefined</code> values in object properties are omitted (key dropped) — use <code>null</code> instead</li>
              <li>BigInt, functions, Symbol rejected (throw)</li>
            </ul>

            <h3 className="mt-6">Hash format</h3>
            <div className="spec-code">
              <code>{`sha256:<64 lowercase hex characters>`}</code>
            </div>
            <p>
              Canonicalization is frozen for v1. Any future stricter canonicalization will ship as a new bundle type (<code>cer.ai.execution.v2</code>), never as a modification to v1.
            </p>
          </section>

          {/* ── Node Attestation ── */}
          <section id="node-attestation" className="mt-12">
            <h2>Node Attestation vs Signed Receipt Stamp</h2>
            <p>
              A CER bundle can exist in three attestation states:
            </p>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Fields Present</th>
                    <th>What You Can Verify</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Not attested</strong></td>
                    <td>None</td>
                    <td>Local integrity only (<code>verify(bundle)</code>)</td>
                  </tr>
                  <tr>
                    <td><strong>Legacy attestation</strong> (stamp incomplete)</td>
                    <td><code>attestationId</code>, <code>nodeRuntimeHash</code></td>
                    <td>Local integrity only — no signature to verify</td>
                  </tr>
                  <tr>
                    <td><strong>Signed receipt</strong> (v0.5.0+)</td>
                    <td><code>receipt</code>, <code>signature</code>, <code>attestorKeyId</code></td>
                    <td>Local integrity + offline Ed25519 signature verification</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Signed receipt verification fetches the node's public keys and checks the Ed25519 signature offline:
            </p>

            <div className="spec-code">
              <code>
{`import { verifyBundleAttestation } from '@nexart/ai-execution';

const result = await verifyBundleAttestation(bundle, {
  nodeUrl: 'https://nexart-canonical-renderer-production.up.railway.app',
});
// result.ok === true  → signature valid
// result.code         → CerVerifyCode enum value`}
              </code>
            </div>

            <h3 className="mt-6">Node keys endpoint</h3>
            <p>
              Public keys are published at:
            </p>
            <div className="spec-code">
              <code>GET &#123;nodeUrl&#125;/.well-known/nexart-node.json</code>
            </div>
            <p>
              <a
                href="https://nexart-canonical-renderer-production.up.railway.app/.well-known/nexart-node.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body underline underline-offset-2 hover:text-foreground break-all"
              >
                View live node keys →
              </a>
            </p>
            <p>
              Keys are provided in JWK, SPKI, and raw Base64url formats. The <code>activeKid</code> field indicates which
              key is used for new attestations. Historical keys remain for backward-compatible verification.
              See{" "}
              <Link to="/docs/certification/node-stamps" className="text-body underline underline-offset-2 hover:text-foreground">
                Node Stamps & Keys
              </Link>{" "}
              for full details.
            </p>
          </section>

          {/* ── Reason Codes ── */}
          <section id="reason-codes" className="mt-12">
            <h2>Reason Codes</h2>
            <p>
              Every verification call returns a machine-readable <code>code</code>:
            </p>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>OK</code></td><td>All hashes match. Record is intact.</td></tr>
                  <tr><td><code>CERTIFICATE_HASH_MISMATCH</code></td><td>Bundle seal doesn't match contents — record was modified.</td></tr>
                  <tr><td><code>INPUT_HASH_MISMATCH</code></td><td>Input was changed after sealing.</td></tr>
                  <tr><td><code>OUTPUT_HASH_MISMATCH</code></td><td>Output was changed after sealing.</td></tr>
                  <tr><td><code>SNAPSHOT_HASH_MISMATCH</code></td><td>Both input and output hashes are wrong.</td></tr>
                  <tr><td><code>INVALID_SHA256_FORMAT</code></td><td>A hash field doesn't start with <code>sha256:</code>.</td></tr>
                  <tr><td><code>SCHEMA_ERROR</code></td><td>Wrong bundleType/version, missing fields, non-finite parameters.</td></tr>
                  <tr><td><code>CANONICALIZATION_ERROR</code></td><td>Canonical JSON serialization threw during verification.</td></tr>
                  <tr><td><code>ATTESTATION_MISSING</code></td><td>No signed receipt found in bundle.</td></tr>
                  <tr><td><code>ATTESTATION_KEY_NOT_FOUND</code></td><td><code>kid</code> not found in node keys document.</td></tr>
                  <tr><td><code>ATTESTATION_INVALID_SIGNATURE</code></td><td>Ed25519 signature did not verify.</td></tr>
                  <tr><td><code>ATTESTATION_KEY_FORMAT_UNSUPPORTED</code></td><td>Key cannot be decoded.</td></tr>
                  <tr><td><code>UNKNOWN_ERROR</code></td><td>Catch-all for unclassified failures.</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-caption">
              Priority when multiple failures exist: CANONICALIZATION_ERROR &gt; SCHEMA_ERROR &gt; INVALID_SHA256_FORMAT &gt; CERTIFICATE_HASH_MISMATCH &gt; hash-level codes &gt; UNKNOWN_ERROR.
              Codes are stable — new codes may be added but existing ones will not be renamed or removed.
            </p>
          </section>

          {/* ── Try It ── */}
          <section id="try-it" className="mt-12">
            <h2>Try It</h2>
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <ul className="text-sm text-body space-y-3 list-none pl-0 mb-0">
                <li>
                  <strong>Issue an AI CER:</strong>{" "}
                  <a href="https://nexartaiauditor.xyz" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground">
                    nexartaiauditor.xyz
                  </a>
                </li>
                <li>
                  <strong>Verify independently:</strong>{" "}
                  <a href="https://recanon.xyz" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground">
                    recanon.xyz
                  </a>
                  {" "}— upload a CER JSON to audit integrity in your browser (no data sent to any server)
                </li>
                <li>
                  <strong>Interactive demo:</strong>{" "}
                  <Link to="/demos/ai-execution" className="text-body underline underline-offset-2 hover:text-foreground">
                    AI Execution Integrity Demo
                  </Link>
                  {" "}— generate a snapshot, seal a CER, and test tamper detection
                </li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-caption">
              This execution surface is additive and does not modify{" "}
              <Link to="/code-mode" className="text-body underline underline-offset-2 hover:text-foreground">
                Code Mode Protocol v1.2.0
              </Link>
              . For step-by-step certification guides, see{" "}
              <Link to="/docs/certification/ai-execution" className="text-body underline underline-offset-2 hover:text-foreground">
                AI Execution Certification
              </Link>
              . For the core protocol, see{" "}
              <Link to="/protocol" className="text-body underline underline-offset-2 hover:text-foreground">
                Protocol Overview
              </Link>
              .
            </p>
          </section>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default AIExecutionIntegrity;
