import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const BuildersCertification = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <SEOHead
        title="Canonical Certification | Verified Deterministic Execution"
        description="Canonical certification proves a deterministic NexArt execution occurred under pinned protocol semantics. Learn what gets sealed, how verification works, and when certification is required."
      />

      <PageHeader title="Canonical Certification" subtitle="Determinism is a property. Certification is proof." />

      <PageContent>
        <article className="prose-protocol prose-spec">
          <h2>What is canonical certification?</h2>
          <p>
            Canonical certification is the process of executing a Code Mode system through the NexArt Canonical Renderer
            and producing a verifiable record of that run. The result is not only an output artifact. It is a sealed
            record that binds inputs, parameters, execution semantics, and outputs.
          </p>

          <p>
            A <strong>certified run</strong> produces:
          </p>
          <ul>
            <li>A deterministic PNG at canonical resolution</li>
            <li>
              A snapshot file (<code>.snapshot.json</code>) containing the full input set
            </li>
            <li>Cryptographic hashes that bind the snapshot to the output</li>
          </ul>

          <p>
            Given the same inputs and pinned protocol version, any compliant renderer produces byte-identical output
            with the same output hash. This is the basis of verification.
          </p>

          <h2>Determinism and certification</h2>
          <p>
            <strong>Determinism</strong> is a property of the system. Given the same seed and parameters, deterministic
            execution produces the same output.
          </p>
          <p>
            <strong>Certification</strong> is evidence that deterministic execution occurred under controlled, versioned
            conditions. It answers a narrower question:{" "}
            <em>did this output come from this system, with these inputs, under these semantics?</em>
          </p>

          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Determinism</th>
                <th>Certification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>What it is</td>
                <td>A system property</td>
                <td>An execution proof</td>
              </tr>
              <tr>
                <td>Requires</td>
                <td>Protocol-compliant logic</td>
                <td>Canonical Renderer execution</td>
              </tr>
              <tr>
                <td>Produces</td>
                <td>Repeatable output</td>
                <td>Verifiable record</td>
              </tr>
              <tr>
                <td>Verifiable by</td>
                <td>Re-execution under the same semantics</td>
                <td>Hash comparison against the sealed record</td>
              </tr>
              <tr>
                <td>Trust model</td>
                <td>Trust the implementation</td>
                <td>Verify the record</td>
              </tr>
            </tbody>
          </table>

          <p>
            You can have determinism without certification during local development. You cannot have certification
            without deterministic semantics.
          </p>

          <h2>What happens during a certified run</h2>
          <p>When a system is submitted to the Canonical Renderer:</p>
          <ol>
            <li>
              <strong>Input validation</strong>. The renderer verifies protocol compliance, validates the seed, and
              checks parameter bounds.
            </li>
            <li>
              <strong>Environment lock</strong>. Execution occurs under pinned runtime and protocol versions, fixed
              canvas dimensions, and deterministic randomness.
            </li>
            <li>
              <strong>Execution</strong>. The system executes once under the controlled runtime. External dependencies
              are not permitted.
            </li>
            <li>
              <strong>Output capture</strong>. The rendered canvas is exported as a PNG at canonical resolution.
            </li>
            <li>
              <strong>Hash generation</strong>. The output and the code are hashed and recorded in the snapshot.
            </li>
            <li>
              <strong>Snapshot emission</strong>. The snapshot is returned alongside the output, containing everything
              needed for later verification.
            </li>
          </ol>

          <h2>Artifacts produced</h2>
          <p>A certified run returns two artifacts:</p>

          <h3>1. Output PNG</h3>
          <p>
            The rendered image at canonical resolution (1950×2400 pixels). This is the output artifact used for minting,
            archival, and verification.
          </p>

          <h3>2. Snapshot file</h3>
          <p>A JSON file containing:</p>
          <div className="spec-code">
            <code>{`{
  "protocolVersion": "1.2.0",
  "seed": "12345",
  "VAR": [50, 50, 50, 0, 0, 0, 0, 0, 0, 0],
  "codeHash": "sha256:...",
  "outputHash": "sha256:...",
  "timestamp": "2025-01-27T...",
  "rendererVersion": "1.8.4"
}`}</code>
          </div>
          <p>
            The <code>outputHash</code> is the fingerprint of the PNG. The <code>codeHash</code> is the fingerprint of
            the source code. Together, they bind inputs to outputs in a verifiable record.
          </p>

          <h2>Canonical constraints</h2>
          <p>The Canonical Renderer enforces constraints required for reproducibility:</p>
          <ul>
            <li>
              <strong>Fixed canvas size</strong>. 1950×2400 pixels.
            </li>
            <li>
              <strong>
                No <code>createCanvas()</code>
              </strong>
              . The canvas is provided by the runtime.
            </li>
            <li>
              <strong>No custom dimensions</strong>. Width and height are protocol constants.
            </li>
            <li>
              <strong>Seeded randomness only</strong>. Randomness must derive from the provided seed. No{" "}
              <code>Math.random()</code>.
            </li>
            <li>
              <strong>No external resources</strong>. No network calls, no filesystem access, no dynamic imports.
            </li>
            <li>
              <strong>No time-dependent behavior</strong>. <code>Date.now()</code> and similar sources of entropy are
              forbidden.
            </li>
          </ul>

          <div className="spec-warning">
            <p className="spec-warning-title">Protocol violation</p>
            <p>
              Violating any constraint results in a <code>400</code> error and the render does not execute.
            </p>
          </div>

          <h2>When certification is needed</h2>
          <p>Certification is required when:</p>
          <ul>
            <li>
              <strong>Minting</strong>. The output will be tokenized or registered on-chain.
            </li>
            <li>
              <strong>Archival</strong>. The output must remain verifiable over time.
            </li>
            <li>
              <strong>Provenance</strong>. Third parties need to confirm the output came from specific code and inputs.
            </li>
            <li>
              <strong>Auditability</strong>. Compliance or contractual requirements demand a verifiable record.
            </li>
            <li>
              <strong>Dispute resolution</strong>. The snapshot serves as evidence of what was executed.
            </li>
          </ul>

          <p>Certification is not required for:</p>
          <ul>
            <li>Local development and iteration</li>
            <li>Exploratory rendering in browser-based tools</li>
            <li>Previewing outputs before committing to a final version</li>
          </ul>

          <h2>What certification is not</h2>
          <p>To avoid confusion:</p>
          <ul>
            <li>
              <strong>Not a quality judgment</strong>. Certification proves execution, not aesthetic value.
            </li>
            <li>
              <strong>Not copy protection</strong>. The output is not encrypted or access-controlled.
            </li>
            <li>
              <strong>Not a blockchain transaction</strong>. Certification happens off-chain. On-chain registration is a
              separate step.
            </li>
            <li>
              <strong>Not a watermark</strong>. The image contains no embedded metadata. The snapshot is separate.
            </li>
            <li>
              <strong>Not DRM</strong>. Certification is proof, not restriction.
            </li>
          </ul>

          <p className="text-caption text-sm mt-8 pt-4 border-t border-border">
            Certified runs are subject to plan limits. See{" "}
            <Link to="/pricing" className="text-link hover:text-link-hover underline underline-offset-2">
              pricing
            </Link>{" "}
            for details.
          </p>

          <h2 className="mt-16 pt-8 border-t border-border">Why certification exists</h2>
          <p className="text-caption">Understanding the problem certification solves.</p>

          <h3>The reproducibility problem</h3>
          <p>
            A deterministic system should produce the same output when re-executed with the same inputs. In practice,
            reproducibility fails when execution semantics are not pinned and verified.
          </p>
          <p>
            Runtime versions change. Dependencies update. Floating-point behavior varies. What rendered correctly in one
            environment can drift or fail in another.
          </p>

          <h3>Why determinism alone degrades over time</h3>
          <p>
            Determinism is necessary but not sufficient. Deterministic behavior today does not guarantee deterministic
            behavior across time or platforms unless the execution surface and semantics are controlled.
          </p>
          <ul>
            <li>
              <strong>Runtime drift</strong>. Different runtime versions can behave differently in edge cases.
            </li>
            <li>
              <strong>Dependency changes</strong>. A dependency update can alter internal behavior.
            </li>
            <li>
              <strong>Platform divergence</strong>. Different architectures can produce different floating-point
              results.
            </li>
            <li>
              <strong>Canvas implementation variance</strong>. Browser canvas and node-canvas are not byte-identical.
            </li>
          </ul>

          <h3>Why canonical environments matter</h3>
          <p>
            A <strong>canonical environment</strong> is a fixed, versioned execution context. It specifies runtime
            versions, canvas dimensions, pinned protocol semantics, and deterministic randomness.
          </p>
          <p>
            When a system runs in the canonical environment, the output is reproducible across time. Given the same
            inputs and semantics, it produces the same output in future verification runs.
          </p>
          <p>This is a prerequisite for any system where outputs have long-term significance.</p>

          <h3>Certification as a trust primitive</h3>
          <p>Certification creates a verifiable chain:</p>
          <ol>
            <li>
              <strong>System to output</strong>. The code produces a specific output under specific inputs.
            </li>
            <li>
              <strong>Output to hash</strong>. The output is fingerprinted and tampering is detectable.
            </li>
            <li>
              <strong>Hash to snapshot</strong>. Hashes are recorded alongside inputs and metadata.
            </li>
            <li>
              <strong>Snapshot to verification</strong>. Any party can replay and compare hashes.
            </li>
          </ol>
          <p>
            This supports trust through verification rather than authority. Parties can verify without relying on the
            creator, the platform, or a marketplace.
          </p>

          <h3>Long-term relevance</h3>
          <p>Certification supports requirements that extend beyond the moment of creation:</p>
          <ul>
            <li>
              <strong>Auditability</strong>. Later verification can confirm an output came from specific code without
              relying on a database lookup.
            </li>
            <li>
              <strong>Compliance</strong>. Some workflows require proof of execution and provenance.
            </li>
            <li>
              <strong>Dispute resolution</strong>. The snapshot answers whether an output came from a specific system.
            </li>
            <li>
              <strong>Archival integrity</strong>. Institutions can preserve the output and the proof.
            </li>
            <li>
              <strong>Decentralized verification</strong>. Anyone with the snapshot and a compliant renderer can verify.
            </li>
          </ul>
          <p>
            Certification is designed for the question that arrives later: <em>how do you know?</em>
          </p>
        </article>

        <div className="flex gap-3 mt-12 pt-8 border-t border-border">
          <Button asChild>
            <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get API Key</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/builders/quickstart">Quickstart</Link>
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default BuildersCertification;
