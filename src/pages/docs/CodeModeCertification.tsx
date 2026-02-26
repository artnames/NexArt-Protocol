import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const CodeModeCertification = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Code Mode Certification | NexArt"
        description="Step-by-step guide to certifying deterministic Code Mode runs with snapshots, node attestation, and CER bundles."
      />

      <PageHeader
        title="Code Mode Certification"
        subtitle="I have a deterministic run — how do I certify it?"
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* On-page navigation */}
          <nav className="mb-10 pb-6 border-b border-border">
            <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">On this page</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm list-none pl-0">
              <li><a href="#minimum-integration" className="text-body underline underline-offset-2 hover:text-foreground">Minimum Integration</a></li>
              <li><a href="#build-snapshot" className="text-body underline underline-offset-2 hover:text-foreground">Build Snapshot</a></li>
              <li><a href="#attest-to-node" className="text-body underline underline-offset-2 hover:text-foreground">Attest to Node</a></li>
              <li><a href="#store-bundle" className="text-body underline underline-offset-2 hover:text-foreground">Store Bundle</a></li>
              <li><a href="#what-gets-stored" className="text-body underline underline-offset-2 hover:text-foreground">What Gets Stored</a></li>
              <li><a href="#verification-outcomes" className="text-body underline underline-offset-2 hover:text-foreground">Verification Outcomes</a></li>
              <li><a href="#try-it" className="text-body underline underline-offset-2 hover:text-foreground">Try It</a></li>
            </ul>
          </nav>

          {/* Minimum integration box */}
          <section id="minimum-integration">
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">Minimum Integration — 3 Steps</p>
              <ol className="text-sm text-body space-y-2 pl-5 mb-0">
                <li><strong>Build snapshot</strong> — Render via CLI or API, receive a sealed snapshot with hashes.</li>
                <li><strong>Attest to node</strong> — Submit the snapshot to a canonical attestation node for a signed receipt.</li>
                <li><strong>Store bundle + proof</strong> — Persist the CER bundle and signed receipt for audit.</li>
              </ol>
            </div>
          </section>

          {/* Step 1 */}
          <section id="build-snapshot">
            <h2>Step 1 — Build Snapshot</h2>
            <p>
              Render your code through the CLI or the Renderer API. The output includes a <code>snapshot.json</code> that
              binds your code, seed, VARs, and rendered output together with SHA-256 hashes.
            </p>

            <div className="spec-code">
              <code>
                <span className="text-caption"># Render and generate snapshot</span>
                {"\n"}
                npx @nexart/cli run ./sketch.js --seed 12345 --include-code --out out.png
                {"\n\n"}
                <span className="text-caption"># Verify snapshot integrity locally</span>
                {"\n"}
                npx @nexart/cli verify out.snapshot.json
                {"\n"}
                <span className="text-caption"># Output: [nexart] Result: PASS</span>
              </code>
            </div>

            <p>
              The snapshot contains the <code>certificateHash</code> — a SHA-256 digest over the canonical JSON of the
              bundle's core fields. Any modification to the code, seed, parameters, or output invalidates this hash.
            </p>
          </section>

          {/* Step 2 */}
          <section id="attest-to-node">
            <h2>Step 2 — Attest to Node</h2>
            <p>
              Submit the sealed bundle to a canonical attestation node. The node verifies internal hash consistency and
              returns a signed receipt proving the bundle was recorded in the proof ledger.
            </p>

            <div className="spec-code">
              <code>
{`import { executeCodeMode } from '@nexart/codemode-sdk/node';

// After rendering, attest the snapshot bundle
const proof = await attest(bundle, {
  nodeUrl: 'https://nexart-canonical-renderer-production.up.railway.app',
  apiKey: process.env.NEXART_API_KEY,
});

console.log(proof.attestationId);
// "att-abc123..."

console.log(proof.signatureB64Url);
// Ed25519 signature over the receipt`}
              </code>
            </div>

            <p>
              <strong>Important:</strong> Attestation verifies internal integrity only. It does not re-run your code or
              re-render the output. The node confirms that the bundle's hashes are self-consistent and records the
              attestation.
            </p>
          </section>

          {/* Step 3 */}
          <section id="store-bundle">
            <h2>Step 3 — Store Bundle + Proof</h2>
            <p>
              Persist the full CER bundle along with the signed receipt. This gives you a complete audit trail: the
              sealed execution record plus third-party proof of integrity.
            </p>

            <div className="spec-code">
              <code>
{`// The bundle contains everything needed for offline verification:
// - snapshot (code hash, seed, VARs, render hash)
// - certificateHash (integrity seal)
// - receipt + signature (node attestation proof)

// Store to your database or archive
await db.insert('cer_bundles', {
  certificate_hash: bundle.certificateHash,
  cer_bundle_redacted: redact(bundle),
  attestation_json: proof,
});`}
              </code>
            </div>
          </section>

          {/* What gets stored */}
          <section id="what-gets-stored">
            <h2>What Gets Stored vs. What Can Be Redacted</h2>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Stored</th>
                    <th>Redactable</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>certificateHash</code></td><td>Always</td><td>No</td><td>Required for verification</td></tr>
                  <tr><td><code>snapshot.codeHash</code></td><td>Always</td><td>No</td><td>Binds code to output</td></tr>
                  <tr><td><code>snapshot.renderHash</code></td><td>Always</td><td>No</td><td>Binds rendered PNG</td></tr>
                  <tr><td><code>snapshot.code</code></td><td>Optional</td><td>Yes</td><td>Source code (may be proprietary)</td></tr>
                  <tr><td><code>meta</code></td><td>Optional</td><td>Yes</td><td>Excluded from certificate hash</td></tr>
                  <tr><td><code>receipt</code></td><td>Recommended</td><td>No</td><td>Node attestation proof</td></tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong>Redaction rule:</strong> Delete keys or set them to <code>null</code>. Never set to{" "}
              <code>undefined</code> — it is not valid JSON and will break canonical serialization.
            </p>
          </section>

          {/* Verification outcomes */}
          <section id="verification-outcomes">
            <h2>Verification Outcomes</h2>
            <p>
              When you or an auditor verifies a Code Mode CER bundle, the result includes a machine-readable reason code:
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
                  <tr><td><code>CERTIFICATE_HASH_MISMATCH</code></td><td>The bundle's seal doesn't match its contents — something was modified.</td></tr>
                  <tr><td><code>SNAPSHOT_HASH_MISMATCH</code></td><td>Both input and output hashes are wrong — likely a reconstructed bundle.</td></tr>
                  <tr><td><code>RENDER_HASH_MISMATCH</code></td><td>The rendered output doesn't match the recorded hash.</td></tr>
                  <tr><td><code>INVALID_SHA256_FORMAT</code></td><td>A hash field is malformed (doesn't start with <code>sha256:</code>).</td></tr>
                  <tr><td><code>SCHEMA_ERROR</code></td><td>Missing required fields or wrong bundle type.</td></tr>
                  <tr><td><code>NODE_RECEIPT_MISSING</code></td><td>No signed receipt found — stamp incomplete.</td></tr>
                  <tr><td><code>NODE_RECEIPT_INVALID_SIGNATURE</code></td><td>The Ed25519 signature on the receipt didn't verify.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Try it */}
          <section id="try-it">
            <h2>Try It</h2>
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <p className="text-sm text-body mb-3">
                <strong>End-to-end demo:</strong> Render a sketch via the CLI, then verify the output independently.
              </p>
              <ol className="text-sm text-body space-y-2 pl-5 mb-4">
                <li>Run <code>npx @nexart/cli run ./sketch.js --seed 42 --include-code --out demo.png</code></li>
                <li>Open <code>demo.snapshot.json</code> — inspect the <code>certificateHash</code></li>
                <li>Verify on <a href="https://recanon.xyz" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground">Recânon</a> — upload the JSON to audit integrity</li>
              </ol>
            </div>
          </section>

          {/* Next steps */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/docs/certification/ai-execution"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              AI Execution Certification →
            </Link>
            <Link
              to="/docs/certification/verify"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              Verify Independently →
            </Link>
          </div>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default CodeModeCertification;
