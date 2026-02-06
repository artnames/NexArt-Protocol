import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SecurityArchitectureDiagram from "@/components/security/SecurityArchitectureDiagram";
const soc2Mapping = [
  {
    area: "Security",
    alignment: "Sandboxed execution, API key authentication, runtime isolation, hashed credentials at rest",
  },
  {
    area: "Availability",
    alignment: "Stateless renderer, controlled quotas, ephemeral execution, no persistent state between requests",
  },
  {
    area: "Processing Integrity",
    alignment: "Deterministic execution, canonical runtime, cryptographic output hashing, protocol versioning",
  },
  {
    area: "Confidentiality",
    alignment: "No external I/O, no payload persistence, no network access during execution, ephemeral environments",
  },
  {
    area: "Auditability",
    alignment: "Replayable snapshots, cryptographic hashes, usage event logging, independent verification",
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
              not added as an afterthought. Deterministic execution is a security primitive: it eliminates hidden state,
              prevents timing-based side channels, and enables independent verification of results.
            </p>
            <p>
              The canonical renderer is stateless and ephemeral. Each execution runs in isolation, produces a
              deterministic result, and is destroyed immediately after completion. No user code, rendered artifacts, or
              input variables persist beyond the request lifecycle.
            </p>
            <p>
              NexArt minimizes data retention by design. The canonical renderer processes user code ephemerally and
              persists only cryptographic proof metadata required for auditability, quota enforcement, and billing.
              NexArt stores certification metadata, not execution payloads.
            </p>
            <p>
              The system is architecturally aligned with SOC2-style controls for security, availability, processing
              integrity, confidentiality, and auditability. However, NexArt does not claim SOC2 certification. This page
              explains the design principles and guarantees that make the system trustworthy for enterprise, fintech,
              and infrastructure use cases.
            </p>
          </section>

          {/* Security Architecture Diagram */}
          <SecurityArchitectureDiagram />

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
              <li>
                <strong>Payload exfiltration</strong> — User code or inputs being captured, stored, or transmitted
                beyond the execution boundary
              </li>
              <li>
                <strong>Environment leakage</strong> — State from one execution affecting or being accessible to another
              </li>
            </ul>
            <p className="text-caption text-sm mt-4">
              NexArt is designed for integrity, auditability, and reproducibility. It is not a general-purpose compute
              platform, an AI inference service, or a hosted execution environment for arbitrary workloads.
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
            <p className="mt-4">Explicit negative guarantees:</p>
            <ul>
              <li>
                <strong>No persistence of user code</strong> — Code is processed and discarded
              </li>
              <li>
                <strong>No persistence of rendered artifacts</strong> — PNG output is returned to the client, not stored
              </li>
              <li>
                <strong>No persistence of user variables</strong> — Input parameters are not retained
              </li>
              <li>
                <strong>No cross-request memory reuse</strong> — Each execution is fully isolated
              </li>
            </ul>
            <p className="mt-4">
              Each execution runs in a sealed environment and is destroyed immediately after completion. User-supplied
              code cannot affect the host system, other executions, or the runtime state. Each execution produces no
              side effects beyond its deterministic output.
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

            <h3 className="mt-6">Security Benefits of Determinism</h3>
            <ul>
              <li>
                <strong>Enables replay</strong> — Any snapshot can be re-executed to produce an identical result
              </li>
              <li>
                <strong>Prevents hidden state</strong> — No execution can depend on or produce undisclosed state
              </li>
              <li>
                <strong>Prevents timing-based side channels</strong> — Execution timing does not vary based on secret
                inputs
              </li>
              <li>
                <strong>Eliminates non-auditable entropy</strong> — All randomness is seeded and reproducible
              </li>
            </ul>

            <h3 className="mt-6">Protocol Versioning</h3>
            <p>
              Determinism is enforced by protocol versioning. Each execution is tagged with a protocol version that
              defines the exact runtime semantics. Protocol versions are immutable and pinned at execution time.
            </p>
            <p>
              The resolved protocol version is returned in response headers (<code>x-protocol-version</code>). Snapshots
              always record the protocol version to ensure reproducibility across time.
            </p>
          </section>

          {/* Data Storage & Retention - NEW SECTION */}
          <section className="mb-12">
            <h2>Data Storage & Retention</h2>
            <p>
              NexArt stores cryptographic evidence of execution, not the execution itself. This section explicitly
              defines what is and is not retained.
            </p>

            <h3 className="mt-6">Data NOT Stored</h3>
            <ul>
              <li>User code</li>
              <li>Rendered PNG artifacts</li>
              <li>Full snapshot JSON</li>
              <li>User input variables</li>
              <li>Secrets inside execution</li>
            </ul>

            <h3 className="mt-6">Data Stored (Metadata Only)</h3>
            <ul>
              <li>Account identifiers</li>
              <li>Hashed API keys (raw keys are never stored)</li>
              <li>Usage events (HTTP status, execution duration, output hashes)</li>
              <li>Subscription state (via Stripe identifiers)</li>
            </ul>

            <p className="text-caption text-sm mt-4 border-l-2 border-border pl-4">
              NexArt persists only the minimum metadata required for auditability, quota enforcement, and billing. No
              customer payloads, code, or artifacts are retained by NexArt infrastructure.
            </p>
            <p className="mt-4">
              NexArt acts as a stateless processor of deterministic execution, not a system of record or data controller
              for customer payloads.
            </p>
          </section>

          {/* API Key & Access Control */}
          <section className="mb-12">
            <h2>API Key & Access Control</h2>
            <p>
              API keys are the authentication mechanism for certified execution. API keys authenticate accounts, not
              entitlements. Plans and quotas are enforced at the account level.
            </p>
            <ul>
              <li>
                <strong>API keys are hashed at rest</strong> — Raw keys are never stored and never recoverable
              </li>
              <li>Keys are scoped to accounts, not individual resources</li>
              <li>Revoked keys are rejected before any execution occurs</li>
              <li>All quota enforcement happens before rendering begins</li>
              <li>Revoked keys never reach the execution layer</li>
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
              run limit. Creating additional API keys does not increase quota capacity.
            </p>
          </section>

          {/* Audit Trail */}
          <section className="mb-12">
            <h2>Audit Trail & Evidence</h2>
            <p>
              NexArt distinguishes between artifacts and proofs. This separation ensures artifacts remain portable while
              their authenticity remains independently verifiable.
            </p>

            <h3 className="mt-6">Artifacts (Returned to Client, Not Stored)</h3>
            <ul>
              <li>
                <strong>PNG output</strong> — The rendered image is returned directly to the client as binary data
              </li>
              <li>
                <strong>Snapshot JSON</strong> — The complete execution record (code, inputs, metadata) is returned to
                the client
              </li>
            </ul>

            <h3 className="mt-6">Proofs (Stored Minimally)</h3>
            <ul>
              <li>
                <strong>Output hash</strong> — SHA-256 hash of the rendered artifact
              </li>
              <li>
                <strong>Runtime hash</strong> — Fingerprint of the exact execution environment
              </li>
              <li>
                <strong>Protocol version</strong> — Immutable version tag for reproducibility
              </li>
            </ul>

            <h3 className="mt-6">Usage Events</h3>
            <p>Usage events are logged for compliance, debugging, and billing:</p>
            <ul>
              <li>Endpoint called</li>
              <li>HTTP status code</li>
              <li>Execution duration</li>
              <li>Error details (if applicable)</li>
            </ul>

            <p className="mt-4">
              Any third party can independently re-execute a snapshot to verify integrity without trusting NexArt. This
              enables independent verification and replay, not just internal logging.
            </p>
          </section>

          {/* Onchain Anchoring */}
          <section className="mb-12">
            <h2>Optional On-Chain Anchoring</h2>
            <p>
              Execution happens off-chain for performance and cost reasons. Proofs can optionally be anchored on-chain
              for tamper-evident timestamping.
            </p>
            <ul>
              <li>Output hashes or Merkle roots can be stored on-chain (e.g., on Base)</li>
              <li>On-chain anchoring provides timestamping and tamper resistance</li>
              <li>No full payloads are required on-chain, only cryptographic commitments</li>
            </ul>
            <p className="mt-4">Scope clarification:</p>
            <ul>
              <li>On-chain anchoring is optional and does not affect execution semantics</li>
              <li>It is used only for timestamping and tamper-evidence, not for execution</li>
              <li>The Canonical Renderer provides verifiable guarantees with or without blockchain integration</li>
            </ul>
          </section>

          {/* SOC2 Mapping */}
          <section className="mb-12">
            <h2>SOC2-Style Control Mapping</h2>
            <p className="mb-4">
              The following table maps NexArt's architecture to SOC2 trust service principles. This represents
              architectural alignment only and does not constitute a certification claim.
            </p>
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
              only and does not constitute a compliance claim. Downstream applications built on NexArt are responsible
              for their own compliance posture.
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
              <li>NexArt does not store customer payloads, code, or rendered artifacts</li>
              <li>NexArt does not retain execution environments beyond request lifecycle</li>
              <li>NexArt does not perform business logic validation or correctness checking</li>
              <li>NexArt does not act as a general compute or AI inference platform</li>
            </ul>
            <p className="mt-4">
              NexArt certifies execution integrity, not correctness or intent. The system guarantees that the same code
              and inputs produce the same output. It does not guarantee that the code or inputs are correct for your use
              case — that remains the responsibility of the builder.
            </p>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Security;
