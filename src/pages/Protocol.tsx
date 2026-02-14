import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";

const Protocol = () => {
  return (
    <PageLayout>
      <SEOHead
        title="NexArt Protocol | Deterministic Execution and Verification Standard"
        description="NexArt Protocol defines a canonical execution layer for deterministic generative workloads, with replayable verification and stable versioned guarantees. Open to third-party builders."
      />

      <PageHeader
        title="NexArt Protocol"
        subtitle="A canonical execution and verification standard for deterministic generative systems."
      />

      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt is a deterministic execution protocol for generative workloads. This page explains what the protocol
            is, why it exists, and how it enables verifiable, permanent computation across media, simulations, and
            research.
          </p>

          <section className="mt-12">
            <h2>What Is the NexArt Protocol</h2>

            <p>
              The NexArt Protocol is a specification for creating, executing, and verifying deterministic generative
              systems. It defines how code should be structured, what execution guarantees it provides, and how outputs
              can be independently verified.
            </p>

            <p>
              NexArt separates the <em>system</em> (the executable rules) from the <em>output</em> (the rendered
              artifact). This separation enables:
            </p>

            <ul>
              <li>
                <strong>Reproducibility</strong> — The same system always produces the same output
              </li>
              <li>
                <strong>Verification</strong> — Any party can re-execute and confirm authenticity
              </li>
              <li>
                <strong>Permanence</strong> — Systems remain executable across time and platforms under a stable
                versioned contract
              </li>
              <li>
                <strong>Interoperability</strong> — Third-party apps can implement the protocol
              </li>
            </ul>

            <p>
              The protocol defines execution semantics, verification rules, and versioned guarantees, not aesthetics.
            </p>
          </section>

          <section className="mt-12">
            <h2>What Is Code Mode</h2>

            <p>
              Code Mode is specified by the <code className="text-caption">@nexart/codemode-sdk</code>, which is the
              single source of truth for deterministic execution semantics. It is a restricted runtime, similar to p5.js
              in syntax, but designed for reproducible execution.
            </p>

            <p>Code Mode enforces:</p>

            <ul>
              <li>
                <strong>Seeded randomness</strong> — All random values derive from a deterministic seed
              </li>
              <li>
                <strong>No external dependencies</strong> — No network calls, no filesystem access
              </li>
              <li>
                <strong>Fixed execution environment</strong> — Canvas size, frame rate, and timing are standardized
              </li>
              <li>
                <strong>Restricted API surface</strong> — Only protocol-approved functions are available
              </li>
            </ul>

            <p>
              This makes Code Mode suitable for certification, long-term archival, simulations, and independent
              verification, including on-chain minting.
            </p>

            <p className="text-caption text-sm">
              Protocol versions define guarantees. Runtime versions are implementations that adhere to those guarantees.
              SDK v1.8.4 supports optional passive builder identity via manifest registration, without affecting
              execution or determinism.
            </p>
          </section>

          <section className="mt-12">
            <h2>Why Determinism Matters</h2>

            <p>
              For generative systems to be trustworthy, they must be verifiable. Whether for financial auditors,
              research peers, or collectors, there must be assurance that the output will be the same tomorrow, next
              year, and decades from now.
            </p>

            <p>Determinism provides this guarantee. When a NexArt system is certified:</p>

            <ul>
              <li>The generative code is stored permanently</li>
              <li>The seed and parameters are recorded</li>
              <li>Anyone can re-execute the system and verify the output</li>
              <li>The output hash confirms authenticity</li>
            </ul>

            <p>
              Any deviation in execution, environment, or semantics will produce a different hash and fail verification.
            </p>

            <p>
              This is fundamentally different from storing a rendered image. The system exists as executable logic, not
              just a stored artifact.
            </p>
          </section>

          <section className="mt-12">
            <h2>The Canonical Renderer</h2>

            <p>
              The Canonical Renderer is the protocol’s authoritative reference implementation for certification-grade
              execution. It is a Node.js-based runtime that produces cryptographically verified outputs for
              certification, archival, and verification workflows.
            </p>

            <p>When a system is certified through a protocol-compliant application:</p>

            <ol>
              <li>The system code and parameters are submitted to the Canonical Renderer</li>
              <li>The renderer executes the code in a controlled environment</li>
              <li>The output (PNG or MP4) is generated</li>
              <li>A cryptographic hash of the output is recorded</li>
              <li>This hash becomes the permanent proof of authenticity</li>
            </ol>

            <p>
              Any party can later re-execute the same system using a protocol-compliant renderer and compare hashes. If
              they match, the output is verified as authentic.
            </p>
          </section>

          <section className="mt-12">
            <h2>Protocol Architecture</h2>

            <h3 className="text-sm font-mono text-caption mt-6 mb-4 tracking-wide uppercase">Execution Trust Chain</h3>

            <div className="space-y-6">
              <div className="border border-border p-6 rounded-sm">
                <h3 className="text-base font-medium text-foreground mb-3">Code Mode SDK</h3>
                <p className="text-caption text-sm mb-2">
                  The language definition and deterministic execution primitives.
                </p>
                <p className="text-caption text-sm">
                  Defines what Code Mode is, including syntax, available functions, and execution rules.
                </p>
              </div>

              <div className="border border-border p-6 rounded-sm">
                <h3 className="text-base font-medium text-foreground mb-3">Canonical Renderer</h3>
                <p className="text-caption text-sm mb-2">The reference runtime for certification and verification.</p>
                <p className="text-caption text-sm">
                  Produces verified outputs with cryptographic proofs. Required for certification-grade runs, audits,
                  and archival.
                </p>
              </div>

              <div className="border border-border p-6 rounded-sm">
                <h3 className="text-base font-medium text-foreground mb-3">Protocol-Compliant Apps</h3>
                <p className="text-caption text-sm mb-2">
                  Applications that implement the protocol correctly. Protocol-compliant apps must not alter execution
                  semantics and must not introduce non-canonical fallback paths for certified outputs.
                </p>
                <p className="text-caption text-sm">
                  Can create, preview, and certify NexArt systems using the SDK and Canonical Renderer.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2>What This Means</h2>

            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-base font-medium text-foreground">For Developers</h3>
                <p className="text-caption">
                  You can build applications that create and certify NexArt systems. Compliance is achieved by
                  integrating the SDK and Canonical Renderer.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground">For Auditors and Compliance</h3>
                <p className="text-caption">
                  You can rely on replayable execution and tamper-evident proof records. A verified hash confirms the
                  output matches the certified run.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground">For Researchers</h3>
                <p className="text-caption">
                  You can publish executable systems with deterministic replay, enabling verification by independent
                  peers.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground">For Creators</h3>
                <p className="text-caption">
                  Your systems are certifiable, replayable, and verifiable. The code is the asset, not just the output
                  it produces.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground">For Collectors</h3>
                <p className="text-caption">
                  You can verify authenticity independently. The cryptographic hash proves the artifact matches the
                  certified system.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-caption">
              For details on protocol compliance levels and third-party integration, see{" "}
              <Link to="/protocol-compliance" className="text-body underline underline-offset-2 hover:text-foreground">
                Protocol Compliance
              </Link>
              .
            </p>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Protocol;
