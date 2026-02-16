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
        title="AI Execution Integrity | Tamper Evident Audit Records (Draft)"
        description="Draft execution surface for capturing AI and LLM runs as tamper-evident audit records. Standardizes snapshots, hashing, and certification using NexArt Protocol v1.2.0."
      />

      <PageHeader
        title="AI Execution Integrity (Draft)"
        subtitle="Execution surface v0.1 built on NexArt Protocol v1.2.0"
        badge={
          <Badge
            variant="outline"
            className="text-xs font-mono border-yellow-600/40 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 mt-1"
          >
            Draft v0.1
          </Badge>
        }
      />

      <PageContent>
        <div className="prose-protocol">
          <div className="border border-yellow-600/30 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-sm px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300 mb-10">
            Draft v0.1. This is an additive execution surface. Code Mode Protocol v1.2.0 remains unchanged.
          </div>

          <section>
            <h2>Overview</h2>
            <p>
              AI Execution Integrity is an additive execution surface built on{" "}
              <Link to="/protocol" className="text-body underline underline-offset-2 hover:text-foreground">
                Protocol v1.2.0
              </Link>{" "}
              that standardizes how AI and LLM runs are captured, sealed, hashed, and audited.
            </p>
            <p>
              It provides a tamper-evident record that binds a specific set of inputs and parameters to a specific
              output. If any part of the record is changed after the fact, the hashes no longer match and tampering is
              detectable.
            </p>

            <p>This surface:</p>
            <ul>
              <li>Provides execution integrity through cryptographic input output binding</li>
              <li>Produces tamper-evident audit records for AI executions</li>
              <li>Supports independent inspection of execution context after the fact</li>
            </ul>

            <p>
              This surface does <strong>not</strong>:
            </p>
            <ul>
              <li>Guarantee provider determinism or stable model behavior over time</li>
              <li>Validate business correctness or factual accuracy of outputs</li>
              <li>Change Code Mode semantics or deterministic execution guarantees</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2>What This Guarantees</h2>
            <ul>
              <li>
                <strong>Input and output integrity</strong>, cryptographic binding between request parameters and
                response
              </li>
              <li>
                <strong>Parameter binding</strong>, model, temperature, seed, and all execution parameters are sealed
                into the record
              </li>
              <li>
                <strong>Execution transparency</strong>, any party can inspect the complete execution context after the
                fact
              </li>
              <li>
                <strong>Optional canonical attestation</strong>, the Canonical Node can attest to the record without
                re-running the execution or changing the original output
              </li>
            </ul>

            <h3 className="text-sm font-mono text-caption mt-8 mb-4 tracking-wide uppercase">
              What This Does Not Guarantee
            </h3>
            <ul>
              <li>
                <strong>Provider behavior stability</strong>, providers may update weights, routing, policies, or
                inference behavior without notice
              </li>
              <li>
                <strong>Output correctness</strong>, the system certifies integrity, not truthfulness or quality
              </li>
              <li>
                <strong>Future re-execution match</strong>, re-running the same prompt may produce different outputs if
                the provider does not support deterministic inference
              </li>
              <li>
                <strong>Deterministic reproduction</strong>, identical prompts may produce different outputs across
                time, regions, or model versions
              </li>
            </ul>
          </section>

          <section className="mt-12">
            <h2>Snapshot Format, ai.execution.v1 (Draft)</h2>
            <p>The execution snapshot captures the parameters required to inspect and audit an AI execution run.</p>
            <pre className="bg-muted/50 border border-border rounded-sm p-4 text-sm font-mono overflow-x-auto mt-4">
              {`{
  "type": "ai.execution.v1",
  "protocolVersion": "1.2.0",
  "executionSurface": "ai",
  "executionId": "<uuid>",
  "timestamp": "<iso8601>",
  "prompt": "<string>",
  "input": "<string | object>",
  "inputHash": "<sha256:hex>",
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
  "outputHash": "<sha256:hex>",
  "sdkVersion": "<string | null>",
  "appId": "<string | null>"
}`}
            </pre>
            <p className="text-caption text-sm mt-3">
              All fields are required unless documented as nullable. Nullable fields must still be present for
              structural consistency.
            </p>
          </section>

          <section className="mt-12">
            <h2>Canonical Hashing Rules</h2>
            <p>All hashes in the snapshot are computed using the following rules:</p>
            <ul>
              <li>
                <strong>Canonical JSON serialization</strong>, keys are sorted lexicographically and serialized without
                whitespace
              </li>
              <li>
                <strong>Exact UTF-8 hashing</strong>, input and output are hashed as raw UTF-8 byte sequences
              </li>
              <li>
                <strong>Stable key ordering</strong>, object keys are deterministically ordered before serialization
              </li>
              <li>
                <strong>Hash algorithm</strong>, <code className="text-caption">sha256(canonicalized_value)</code>,
                hex-encoded, prefixed with <code className="text-caption">sha256:</code>
              </li>
              <li>
                <strong>No provider formatting trusted</strong>, objects must be canonicalized before hashing
              </li>
            </ul>
          </section>

          <section className="mt-12">
            <h2>Certification and Re-Certification</h2>
            <p>
              A <strong>Certified Execution Record (CER)</strong> seals the execution metadata and hashes into a single
              verifiable unit. The CER includes the snapshot, timestamps, and certifying node identity.
            </p>
            <p>Certification attests to integrity, not output correctness.</p>
            <p>The Canonical Node can optionally re-certify an existing CER. Re-certification:</p>
            <ul>
              <li>Does not modify the original execution record or its provenance</li>
              <li>Adds a canonical attestation layer with the node signature and timestamp</li>
              <li>Supports third-party trust anchoring without altering provenance</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2>Example Snapshot, Text Output</h2>
            <pre className="bg-muted/50 border border-border rounded-sm p-4 text-sm font-mono overflow-x-auto mt-4">
              {`{
  "type": "ai.execution.v1",
  "protocolVersion": "1.2.0",
  "executionSurface": "ai",
  "executionId": "b7e2c3a1-9f4d-4e8b-a1c6-3d5e7f9a2b4c",
  "timestamp": "2025-06-15T14:32:07.841Z",
  "prompt": "Summarize the key risks in Q4 earnings.",
  "input": "Revenue declined 12% YoY...",
  "inputHash": "sha256:a3f8c1...d94e",
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
  "outputHash": "sha256:e7b2a0...f31c",
  "sdkVersion": "1.8.4",
  "appId": "velocity-risk-engine"
}`}
            </pre>
          </section>

          <section className="mt-12">
            <h2>Example Snapshot, JSON Output</h2>
            <pre className="bg-muted/50 border border-border rounded-sm p-4 text-sm font-mono overflow-x-auto mt-4">
              {`{
  "type": "ai.execution.v1",
  "protocolVersion": "1.2.0",
  "executionSurface": "ai",
  "executionId": "d4f1a8c3-2b7e-4d9f-b3a5-6c8e1f0d2a4b",
  "timestamp": "2025-06-15T15:01:44.209Z",
  "prompt": "Classify the sentiment of this review.",
  "input": {
    "text": "The product exceeded expectations.",
    "locale": "en-US"
  },
  "inputHash": "sha256:b4d1e2...8a7f",
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
  "outputHash": "sha256:c9f3d4...2b1e",
  "sdkVersion": null,
  "appId": null
}`}
            </pre>
          </section>

          <section className="mt-12">
            <h2>Relationship to Certified Execution Records (CER)</h2>
            <p>
              AI Execution Integrity snapshots can be sealed into a Certified Execution Record following the same
              certification structure used by Code Mode. This keeps verification tooling consistent across deterministic
              and non-deterministic execution surfaces.
            </p>
          </section>

          <section className="mt-12">
            <h2>Try the Demo</h2>
            <p>
              See AI Execution Integrity in action, generate a snapshot, seal a CER, and test tamper detection in your
              browser:{" "}
              <Link to="/demos/ai-execution" className="text-body underline underline-offset-2 hover:text-foreground">
                AI Execution Integrity Demo
              </Link>
              .
            </p>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-caption">
              This execution surface is additive and does not modify{" "}
              <Link to="/code-mode" className="text-body underline underline-offset-2 hover:text-foreground">
                Code Mode Protocol v1.2.0
              </Link>
              . For the core protocol specification, see{" "}
              <Link to="/protocol" className="text-body underline underline-offset-2 hover:text-foreground">
                Protocol Overview
              </Link>
              .
            </p>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default AIExecutionIntegrity;
