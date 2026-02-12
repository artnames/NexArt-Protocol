import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const AIExecutionIntegrity = () => {
  return (
    <PageLayout>
      <SEOHead
        title="AI Execution Integrity (Draft)"
        description="Execution Surface v0.1 for AI and LLM runs built on NexArt Protocol v1.2.0. Standardizes how AI executions are captured, sealed, and audited with tamper-evident records."
      />

      <PageHeader
        title="AI Execution Integrity (Draft)"
        subtitle="Execution Surface v0.1 — Built on NexArt Protocol v1.2.0"
        badge={
          <Badge variant="outline" className="text-xs font-mono border-yellow-600/40 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 mt-1">
            Draft v0.1
          </Badge>
        }
      />

      <PageContent>
        <div className="prose-protocol">
          {/* Status Banner */}
          <div className="border border-yellow-600/30 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-sm px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300 mb-10">
            Draft v0.1 — Additive execution surface. Code Mode Protocol v1.2.0 remains unchanged.
          </div>

          {/* Overview */}
          <section>
            <h2>Overview</h2>
            <p>
              NexArt AI Execution Integrity is an execution surface built on{" "}
              <Link to="/protocol" className="text-body underline underline-offset-2 hover:text-foreground">
                Protocol v1.2.0
              </Link>{" "}
              that standardizes how AI and LLM runs are captured, sealed, and audited.
            </p>
            <p>This surface:</p>
            <ul>
              <li>Guarantees execution integrity (input-output binding)</li>
              <li>Provides tamper-evident records of AI executions</li>
              <li>Enables independent auditability of AI pipeline outputs</li>
            </ul>
            <p>This surface does <strong>not</strong>:</p>
            <ul>
              <li>Guarantee provider-level determinism (model providers may change behavior between versions)</li>
              <li>Change Code Mode semantics or execution guarantees</li>
            </ul>
          </section>

          {/* What This Guarantees */}
          <section className="mt-12">
            <h2>What This Guarantees</h2>
            <ul>
              <li><strong>Input + output integrity</strong> — Cryptographic binding between request parameters and response</li>
              <li><strong>Parameter binding</strong> — Model, temperature, seed, and all execution parameters are sealed into the record</li>
              <li><strong>Replay inspection</strong> — Any party can inspect the full execution context after the fact</li>
              <li><strong>Optional canonical re-certification</strong> — The Canonical Node can attest to the record without modifying it</li>
            </ul>

            <h3 className="text-sm font-mono text-caption mt-8 mb-4 tracking-wide uppercase">
              What This Does Not Guarantee
            </h3>
            <ul>
              <li><strong>Model provider behavior stability</strong> — Providers may update weights, routing, or inference behavior without notice</li>
              <li><strong>Business truth validation</strong> — The system certifies execution integrity, not the correctness of outputs</li>
              <li><strong>Future re-execution match</strong> — Without provider-side determinism, re-running the same prompt may produce different outputs</li>
            </ul>
          </section>

          {/* Snapshot Format */}
          <section className="mt-12">
            <h2>Snapshot Format — ai.execution.v1 (Draft)</h2>
            <p>
              The execution snapshot captures all parameters required to audit and inspect an AI execution run.
            </p>
            <pre className="bg-muted/50 border border-border rounded-sm p-4 text-sm font-mono overflow-x-auto mt-4">
{`{
  "type": "ai.execution.v1",
  "protocolVersion": "1.2.0",
  "executionSurface": "ai",
  "prompt": "<string>",
  "input": "<string | object>",
  "inputHash": "<sha256>",
  "provider": "<string>",
  "model": "<string>",
  "modelVersion": "<string | null>",
  "parameters": {
    "temperature": "<number>",
    "maxTokens": "<number>",
    "topP": "<number | null>",
    "seed": "<number | null>"
  },
  "output": "<string | object>",
  "outputHash": "<sha256>",
  "sdkVersion": "<string | null>",
  "appId": "<string | null>"
}`}
            </pre>
            <p className="text-caption text-sm mt-3">
              Fields marked as <code className="text-caption">null</code> are optional. All other fields are required for a valid snapshot.
            </p>
          </section>

          {/* Canonical Hashing Rules */}
          <section className="mt-12">
            <h2>Canonical Hashing Rules</h2>
            <p>
              All hashes in the snapshot are computed using the following rules:
            </p>
            <ul>
              <li><strong>Canonical JSON serialization</strong> — Keys are sorted lexicographically, no whitespace</li>
              <li><strong>UTF-8 exact string hashing</strong> — Input and output are hashed as raw UTF-8 byte sequences</li>
              <li><strong>Stable key ordering</strong> — Object keys are deterministically ordered before serialization</li>
              <li><strong>Hash algorithm</strong> — <code className="text-caption">sha256(canonicalized_value)</code>, hex-encoded</li>
            </ul>
          </section>

          {/* Certification & Re-Certification */}
          <section className="mt-12">
            <h2>Certification and Re-Certification</h2>
            <p>
              A <strong>Certified Execution Record (CER)</strong> seals the execution metadata and hashes into a single verifiable unit. The CER includes the snapshot, timestamps, and the certifying node identity.
            </p>
            <p>
              The Canonical Node can optionally <strong>re-certify</strong> an existing CER. Re-certification:
            </p>
            <ul>
              <li>Does not modify the original execution record</li>
              <li>Adds a canonical attestation layer with the node's signature and timestamp</li>
              <li>Enables third-party trust anchoring without altering execution provenance</li>
            </ul>
          </section>

          {/* Example: Text Output */}
          <section className="mt-12">
            <h2>Example Snapshot (Text Output)</h2>
            <pre className="bg-muted/50 border border-border rounded-sm p-4 text-sm font-mono overflow-x-auto mt-4">
{`{
  "type": "ai.execution.v1",
  "protocolVersion": "1.2.0",
  "executionSurface": "ai",
  "prompt": "Summarize the key risks in Q4 earnings.",
  "input": "Revenue declined 12% YoY...",
  "inputHash": "a3f8c1...d94e",
  "provider": "openai",
  "model": "gpt-4o",
  "modelVersion": "2025-01-15",
  "parameters": {
    "temperature": 0,
    "maxTokens": 1024,
    "topP": null,
    "seed": 42
  },
  "output": "Key risks identified: (1) Revenue contraction...",
  "outputHash": "e7b2a0...f31c",
  "sdkVersion": "1.8.4",
  "appId": "velocity-risk-engine"
}`}
            </pre>
          </section>

          {/* Example: JSON Output */}
          <section className="mt-12">
            <h2>Example Snapshot (JSON Output)</h2>
            <pre className="bg-muted/50 border border-border rounded-sm p-4 text-sm font-mono overflow-x-auto mt-4">
{`{
  "type": "ai.execution.v1",
  "protocolVersion": "1.2.0",
  "executionSurface": "ai",
  "prompt": "Classify the sentiment of this review.",
  "input": {
    "text": "The product exceeded expectations.",
    "locale": "en-US"
  },
  "inputHash": "b4d1e2...8a7f",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "modelVersion": null,
  "parameters": {
    "temperature": 0,
    "maxTokens": 256,
    "topP": 1,
    "seed": null
  },
  "output": {
    "sentiment": "positive",
    "confidence": 0.97,
    "labels": ["satisfaction", "quality"]
  },
  "outputHash": "c9f3d4...2b1e",
  "sdkVersion": null,
  "appId": null
}`}
            </pre>
          </section>

          {/* Footer link */}
          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-caption">
              This execution surface is additive and does not modify the{" "}
              <Link to="/code-mode" className="text-body underline underline-offset-2 hover:text-foreground">
                Code Mode Protocol v1.2.0
              </Link>
              . For the core protocol specification, see{" "}
              <Link to="/protocol" className="text-body underline underline-offset-2 hover:text-foreground">
                Protocol Overview
              </Link>.
            </p>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default AIExecutionIntegrity;
