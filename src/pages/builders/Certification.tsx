import { Helmet } from "react-helmet-async";
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
      <Helmet>
        <title>Canonical Certification — NexArt Protocol</title>
        <meta
          name="description"
          content="What canonical certification means in the NexArt protocol. Deterministic execution, verifiable snapshots, and reproducibility guarantees."
        />
      </Helmet>

      <PageHeader
        title="Canonical Certification"
        subtitle="Determinism is a property. Certification is proof."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* What is Canonical Certification */}
          <h2>What is canonical certification?</h2>
          <p>
            Canonical certification is the process of executing a Code Mode sketch through 
            the NexArt canonical renderer and producing cryptographically verifiable proof 
            of that execution. The result is not just an image — it is an auditable record 
            that ties inputs, outputs, and execution environment together.
          </p>
          <p>
            A <strong>certified run</strong> produces:
          </p>
          <ul>
            <li>A deterministic PNG at canonical resolution</li>
            <li>A snapshot file (<code>.snapshot.json</code>) containing all input parameters</li>
            <li>Cryptographic hashes linking the snapshot to the output</li>
          </ul>
          <p>
            Given the same inputs, any compliant renderer will produce byte-identical output 
            with the same hash. This is the foundation of NexArt's reproducibility guarantee.
          </p>

          {/* Determinism vs Certification */}
          <h2>Determinism vs. certification</h2>
          <p>
            <strong>Determinism</strong> is a property of the code. A deterministic sketch, 
            given the same seed and parameters, will always produce the same output.
          </p>
          <p>
            <strong>Certification</strong> is proof that determinism was exercised under 
            controlled conditions. It answers: <em>was this output actually produced by 
            running this code with these inputs?</em>
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
                <td>A code property</td>
                <td>An execution proof</td>
              </tr>
              <tr>
                <td>Requires</td>
                <td>Compliant code</td>
                <td>Canonical renderer</td>
              </tr>
              <tr>
                <td>Produces</td>
                <td>Repeatable output</td>
                <td>Verifiable record</td>
              </tr>
              <tr>
                <td>Verifiable by</td>
                <td>Re-execution</td>
                <td>Hash comparison</td>
              </tr>
              <tr>
                <td>Trust model</td>
                <td>Trust the code</td>
                <td>Trust the protocol</td>
              </tr>
            </tbody>
          </table>
          <p>
            You can have determinism without certification (local execution). You cannot 
            have certification without determinism.
          </p>

          {/* What happens during a certified run */}
          <h2>What happens during a certified run</h2>
          <p>
            When a sketch is submitted to the canonical renderer:
          </p>
          <ol>
            <li>
              <strong>Input validation</strong> — The renderer verifies the sketch is 
              protocol-compliant, the seed is valid, and all parameters are within bounds.
            </li>
            <li>
              <strong>Environment lock</strong> — Execution occurs in a controlled environment 
              with pinned runtime versions, fixed canvas dimensions, and deterministic RNG.
            </li>
            <li>
              <strong>Execution</strong> — The sketch runs exactly once. No retries, no 
              branching, no external dependencies.
            </li>
            <li>
              <strong>Output capture</strong> — The rendered canvas is exported as a PNG 
              at canonical resolution.
            </li>
            <li>
              <strong>Hash generation</strong> — The output is hashed. The code is hashed. 
              Both are recorded in the snapshot.
            </li>
            <li>
              <strong>Snapshot emission</strong> — The snapshot file is returned alongside 
              the image, containing everything needed for future verification.
            </li>
          </ol>

          {/* Artifacts produced */}
          <h2>Artifacts produced</h2>
          <p>
            A certified run returns two artifacts:
          </p>
          <h3>1. Output PNG</h3>
          <p>
            The rendered image at canonical resolution (1950×2400 pixels). This is the 
            visual output of the sketch.
          </p>
          <h3>2. Snapshot file</h3>
          <p>
            A JSON file containing:
          </p>
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
            The <code>outputHash</code> is the cryptographic fingerprint of the PNG. 
            The <code>codeHash</code> is the fingerprint of the source code. Together, 
            they form an immutable link between input and output.
          </p>

          {/* Canonical constraints */}
          <h2>Canonical constraints</h2>
          <p>
            The canonical renderer enforces strict constraints to ensure reproducibility:
          </p>
          <ul>
            <li>
              <strong>Fixed canvas size</strong> — 1950×2400 pixels. No exceptions.
            </li>
            <li>
              <strong>No <code>createCanvas()</code></strong> — The canvas is provided 
              by the runtime. Do not create your own.
            </li>
            <li>
              <strong>No custom dimensions</strong> — Width and height are not parameters. 
              They are protocol constants.
            </li>
            <li>
              <strong>Seeded RNG only</strong> — All randomness must derive from the 
              provided seed. No <code>Math.random()</code>.
            </li>
            <li>
              <strong>No external resources</strong> — No network calls, no file system 
              access, no dynamic imports.
            </li>
            <li>
              <strong>No time-dependent behavior</strong> — <code>Date.now()</code> and 
              similar are forbidden.
            </li>
          </ul>
          <div className="spec-warning">
            <p className="spec-warning-title">Protocol violation</p>
            <p>
              Violating any constraint results in a <code>400</code> error. The render 
              will not execute.
            </p>
          </div>

          {/* When certification is needed */}
          <h2>When certification is needed</h2>
          <p>
            Certification is required when:
          </p>
          <ul>
            <li>
              <strong>Minting</strong> — The output will be tokenized or registered 
              on-chain.
            </li>
            <li>
              <strong>Archival</strong> — The output must be reproducible indefinitely.
            </li>
            <li>
              <strong>Provenance</strong> — Third parties need to verify the output 
              was produced by specific code and inputs.
            </li>
            <li>
              <strong>Auditability</strong> — Compliance, legal, or contractual 
              requirements demand a verifiable record.
            </li>
            <li>
              <strong>Dispute resolution</strong> — The snapshot serves as evidence 
              of what was executed.
            </li>
          </ul>
          <p>
            Certification is <em>not</em> required for:
          </p>
          <ul>
            <li>Local development and iteration</li>
            <li>Exploratory rendering in browser-based tools</li>
            <li>Previewing outputs before committing to a final version</li>
          </ul>

          {/* What certification is not */}
          <h2>What certification is not</h2>
          <p>
            To avoid confusion:
          </p>
          <ul>
            <li>
              <strong>Not a quality judgment</strong> — Certification proves execution, 
              not aesthetic value.
            </li>
            <li>
              <strong>Not copy protection</strong> — The output is not encrypted or 
              access-controlled. Anyone can view it.
            </li>
            <li>
              <strong>Not a blockchain transaction</strong> — Certification happens 
              off-chain. On-chain registration is a separate, optional step.
            </li>
            <li>
              <strong>Not a watermark</strong> — The image contains no embedded metadata. 
              The snapshot is a separate file.
            </li>
            <li>
              <strong>Not DRM</strong> — Certification is about proof, not restriction.
            </li>
          </ul>

          {/* Plan limits reference */}
          <p className="text-caption text-sm mt-8 pt-4 border-t border-border">
            Certified runs are subject to plan limits. See{" "}
            <Link to="/pricing" className="text-link hover:text-link-hover underline underline-offset-2">
              pricing
            </Link>{" "}
            for details.
          </p>

          {/* Why Certification Exists */}
          <h2 className="mt-16 pt-8 border-t border-border">Why certification exists</h2>
          <p className="text-caption">
            Understanding the problem certification solves.
          </p>

          {/* The reproducibility problem */}
          <h3>The reproducibility problem</h3>
          <p>
            Generative systems produce outputs from code. If the code is deterministic, 
            running it again should produce the same output. In theory.
          </p>
          <p>
            In practice, reproducibility fails. Runtime versions change. Dependencies 
            update. Floating-point behavior varies across platforms. What rendered 
            correctly in 2024 may render differently in 2027 — or fail entirely.
          </p>
          <p>
            This is not a hypothetical risk. It is the default outcome for any 
            software system without explicit reproducibility guarantees.
          </p>

          {/* Why determinism degrades */}
          <h3>Why determinism alone degrades over time</h3>
          <p>
            Determinism is necessary but not sufficient. A sketch may be deterministic 
            <em>today</em> — same seed, same output. But determinism is fragile:
          </p>
          <ul>
            <li>
              <strong>Runtime drift</strong> — Node.js 18 and Node.js 22 may handle 
              edge cases differently.
            </li>
            <li>
              <strong>Dependency rot</strong> — A library update changes internal 
              behavior.
            </li>
            <li>
              <strong>Platform divergence</strong> — ARM and x86 produce different 
              floating-point results.
            </li>
            <li>
              <strong>Canvas implementation</strong> — Browser canvas and node-canvas 
              are not byte-identical.
            </li>
          </ul>
          <p>
            Without a controlled environment, determinism is a local property that 
            does not survive time or platform changes.
          </p>

          {/* Why canonical environments matter */}
          <h3>Why canonical environments matter</h3>
          <p>
            A <strong>canonical environment</strong> is a fixed, versioned execution 
            context. It specifies:
          </p>
          <ul>
            <li>Exact runtime versions (Node.js, canvas library, etc.)</li>
            <li>Fixed canvas dimensions and pixel format</li>
            <li>Pinned protocol version</li>
            <li>Deterministic random number generation</li>
          </ul>
          <p>
            When a sketch runs in the canonical environment, the output is not just 
            deterministic — it is <em>reproducible across time</em>. The same inputs 
            will produce the same output in 2025, 2030, or 2040, as long as the 
            canonical renderer is preserved.
          </p>
          <p>
            This is not a convenience. It is a prerequisite for any system where 
            outputs have long-term significance.
          </p>

          {/* Certification as a trust primitive */}
          <h3>Certification as a trust primitive</h3>
          <p>
            Certification creates a trust chain:
          </p>
          <ol>
            <li>
              <strong>Code → Output</strong> — The sketch, given specific inputs, 
              produces a specific output.
            </li>
            <li>
              <strong>Output → Hash</strong> — The output is fingerprinted. Any 
              modification is detectable.
            </li>
            <li>
              <strong>Hash → Snapshot</strong> — The hash is recorded alongside 
              inputs and metadata.
            </li>
            <li>
              <strong>Snapshot → Verification</strong> — Anyone can re-run the 
              sketch and confirm the hash matches.
            </li>
          </ol>
          <p>
            This chain is the basis for trust without authority. You do not need 
            to trust the artist, the platform, or the marketplace. You can verify.
          </p>

          {/* Long-term relevance */}
          <h3>Long-term relevance</h3>
          <p>
            Certification addresses requirements that extend beyond the moment of creation:
          </p>
          <ul>
            <li>
              <strong>Auditability</strong> — Years later, a third party can verify 
              that an output was produced by specific code. No database lookup required.
            </li>
            <li>
              <strong>Compliance</strong> — Regulatory or contractual requirements 
              may demand proof of origin and execution.
            </li>
            <li>
              <strong>Dispute resolution</strong> — The snapshot is evidence. It 
              answers: <em>was this the output of that code?</em>
            </li>
            <li>
              <strong>Archival integrity</strong> — Museums, collectors, and 
              institutions can preserve not just the image, but the proof.
            </li>
            <li>
              <strong>Decentralized verification</strong> — Verification does not 
              depend on NexArt. Anyone with the snapshot and a compliant renderer 
              can verify.
            </li>
          </ul>
          <p>
            Certification is not about today's transaction. It is about tomorrow's 
            question: <em>how do you know?</em>
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
