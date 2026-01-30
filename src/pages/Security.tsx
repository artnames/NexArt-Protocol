import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const soc2Mapping = [
  {
    area: "Security",
    alignment: "Sandboxed execution, API key authentication, runtime isolation",
  },
  {
    area: "Availability",
    alignment: "Stateless renderer, controlled quotas, no persistent state between executions",
  },
  {
    area: "Processing Integrity",
    alignment: "Deterministic execution, canonical runtime, cryptographic output hashing",
  },
  {
    area: "Confidentiality",
    alignment: "No external I/O, no data persistence beyond snapshots, no network access during execution",
  },
  {
    area: "Auditability",
    alignment: "Replayable snapshots, cryptographic hashes, usage event logging",
  },
];

const Security = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Security Architecture — NexArt Protocol</title>
        <meta
          name="description"
          content="How NexArt enforces deterministic, sandboxed, and auditable execution. Security architecture aligned with SOC2-style controls."
        />
      </Helmet>

      <PageHeader
        title="Security Architecture"
        subtitle="How NexArt enforces deterministic, sandboxed, and auditable execution."
      />

      <PageContent>
        <div className="prose-protocol">
          {/* Overview */}
          <section className="mb-12">
            <h2>Overview</h2>
            <p>
              NexArt is a deterministic execution and certification system. Security is enforced at the execution layer,
              not added as an afterthought. The architecture is designed to support auditability, replayability, and
              isolation from the ground up.
            </p>
            <p>
              The system is architecturally aligned with SOC2-style controls for security, availability, processing
              integrity, confidentiality, and auditability. However, NexArt does not claim SOC2 certification. This page
              explains the design principles and guarantees that make the system trustworthy for enterprise, fintech,
              and infrastructure use cases.
            </p>
          </section>

          {/* Threat Model */}
          <section className="mb-12">
            <h2>Threat Model</h2>
            <p>NexArt is designed to defend against:</p>
            <ul>
              <li>
                <strong>Non-deterministic drift</strong> — Hidden changes in output due to environment, timing, or
                entropy
              </li>
              <li>
                <strong>Undocumented runtime changes</strong> — Execution environment modifications that alter results
              </li>
              <li>
                <strong>Output manipulation after execution</strong> — Tampering with results post-render
              </li>
              <li>
                <strong>Replay or result forgery</strong> — Claiming a result was produced when it was not
              </li>
              <li>
                <strong>Unauthorized API key usage</strong> — Revoked or invalid keys being used for execution
              </li>
            </ul>
            <p className="text-caption text-sm mt-4">
              NexArt is designed for integrity, auditability, and reproducibility. It is not a general-purpose compute
              platform.
            </p>
          </section>

          {/* Execution Isolation */}
          <section className="mb-12">
            <h2>Execution Isolation & Sandboxing</h2>
            <p>The Canonical Renderer operates as a locked execution environment with strict isolation:</p>
            <ul>
              <li>Fixed runtime with pinned dependencies</li>
              <li>Fixed canvas dimensions (1950×2400)</li>
              <li>Deterministic randomness seeded from input parameters</li>
              <li>No filesystem access</li>
              <li>No network access during execution</li>
              <li>No escape hatches for user code</li>
            </ul>
            <p>
              User-supplied code cannot affect the host system, other executions, or the runtime state. Each execution
              is fully isolated and produces no side effects beyond its deterministic output.
            </p>
          </section>

          {/* Determinism as Security */}
          <section className="mb-12">
            <h2>Determinism as a Security Property</h2>
            <p>
              Determinism is not just a feature — it is a security guarantee. By ensuring that the same code and inputs
              always produce the same output, NexArt eliminates entire classes of vulnerabilities:
            </p>
            <ul>
              <li>Same code + inputs → same output hash (always)</li>
              <li>No timing dependencies that could leak information</li>
              <li>No entropy sources that could introduce unpredictability</li>
              <li>No environment leakage between executions</li>
            </ul>
            <p>
              Snapshots capture all inputs, parameters, and protocol metadata, enabling full replay and independent
              verification. This is anti-drift and anti-tampering by design.
            </p>
          </section>

          {/* API Key & Access Control */}
          <section className="mb-12">
            <h2>API Key & Access Control</h2>
            <p>
              API keys are the authentication mechanism for certified execution. The system enforces strict access
              control:
            </p>
            <ul>
              <li>API keys are hashed at rest — raw keys are never stored</li>
              <li>Keys are scoped to accounts, not individual resources</li>
              <li>Revoked keys are rejected before any execution occurs</li>
              <li>All quota enforcement happens before rendering begins</li>
            </ul>
            <p className="mt-4">Access control responses:</p>
            <ul>
              <li>
                <code>401 Unauthorized</code> — Invalid or revoked API key
              </li>
              <li>
                <code>429 Too Many Requests</code> — Account quota exceeded
              </li>
            </ul>
            <p className="text-caption text-sm mt-4">
              Quotas are enforced at the account level. All API keys under an account share the same monthly certified
              run limit.
            </p>
          </section>

          {/* Audit Trail */}
          <section className="mb-12">
            <h2>Audit Trail & Evidence</h2>
            <p>Every certified run produces cryptographic evidence for independent verification:</p>
            <ul>
              <li>
                <strong>Output hash</strong> — SHA-256 hash of the rendered artifact
              </li>
              <li>
                <strong>Snapshot</strong> — Complete record of inputs, vars, protocol version, and runtime fingerprint
              </li>
              <li>
                <strong>Runtime hash</strong> — Fingerprint of the exact execution environment
              </li>
            </ul>
            <p className="mt-4">Usage events are logged for compliance and debugging:</p>
            <ul>
              <li>Endpoint called</li>
              <li>HTTP status code</li>
              <li>Execution duration</li>
              <li>Error details (if applicable)</li>
            </ul>
            <p>
              This enables independent verification and replay, not just internal logging. Any party with the snapshot
              can re-execute and verify the result matches.
            </p>
          </section>

          {/* Onchain Anchoring */}
          <section className="mb-12">
            <h2>Optional Onchain Anchoring</h2>
            <p>
              Execution happens off-chain for performance and cost reasons. However, proofs can optionally be anchored
              onchain for tamper-evident timestamping:
            </p>
            <ul>
              <li>Output hashes or Merkle roots can be stored onchain (e.g., on Base)</li>
              <li>Onchain anchoring provides timestamping and tamper resistance</li>
              <li>No full payloads are required onchain, only cryptographic commitments</li>
            </ul>
            <p className="text-caption text-sm mt-4">
              Onchain anchoring is optional. The Canonical Renderer provides verifiable guarantees with or without
              blockchain integration.
            </p>
          </section>

          {/* SOC2 Mapping */}
          <section className="mb-12">
            <h2>SOC2-Style Control Mapping</h2>
            <p className="mb-4">The following table maps NexArt's architecture to SOC2 trust service principles:</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">SOC2 Area</TableHead>
                    <TableHead>NexArt Alignment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {soc2Mapping.map((row) => (
                    <TableRow key={row.area}>
                      <TableCell className="font-medium">{row.area}</TableCell>
                      <TableCell>{row.alignment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-caption text-sm mt-4 border-l-2 border-border pl-4">
              <strong>Disclaimer:</strong> NexArt is not SOC2 certified. This mapping explains architectural alignment
              only and does not constitute a compliance claim.
            </p>
          </section>

          {/* Trust Boundaries */}
          <section className="mb-12">
            <h2>What NexArt Does Not Do</h2>
            <p>To build trust, it is important to be explicit about boundaries:</p>
            <ul>
              <li>NexArt does not execute arbitrary system code</li>
              <li>NexArt does not store secrets inside execution environments</li>
              <li>NexArt does not replace full financial audits or compliance reviews</li>
              <li>NexArt certifies execution integrity, not business correctness</li>
            </ul>
            <p className="mt-4">
              The system guarantees that the same code and inputs produce the same output. It does not guarantee that
              the code or inputs are correct for your use case, that remains the responsibility of the builder.
            </p>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Security;
