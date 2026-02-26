import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const VerifyIndependently = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Verify Independently | NexArt"
        description="How auditors and third parties verify NexArt CER bundles without trusting a database — local integrity checks, node stamp verification, and browser vs server approaches."
      />

      <PageHeader
        title="Verify Independently"
        subtitle="Auditor or third party? Verify without trusting a database."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* On-page navigation */}
          <nav className="mb-10 pb-6 border-b border-border">
            <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">On this page</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm list-none pl-0">
              <li><a href="#minimum-integration" className="text-body underline underline-offset-2 hover:text-foreground">Minimum Integration</a></li>
              <li><a href="#local-integrity" className="text-body underline underline-offset-2 hover:text-foreground">Local Integrity</a></li>
              <li><a href="#node-stamp" className="text-body underline underline-offset-2 hover:text-foreground">Node Stamp Verification</a></li>
              <li><a href="#browser-vs-server" className="text-body underline underline-offset-2 hover:text-foreground">Browser vs Server</a></li>
              <li><a href="#stamp-incomplete" className="text-body underline underline-offset-2 hover:text-foreground">Stamp Incomplete</a></li>
            </ul>
          </nav>

          {/* Minimum integration box */}
          <section id="minimum-integration">
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">Minimum Integration — 3 Steps</p>
              <ol className="text-sm text-body space-y-2 pl-5 mb-0">
                <li><strong>Load</strong> — Parse the CER bundle JSON (use <code>importCer(json)</code> or <code>JSON.parse</code>).</li>
                <li><strong>Verify locally</strong> — Call <code>verify(bundle)</code> to check certificate hash and snapshot hashes.</li>
                <li><strong>Verify stamp</strong> — If a signed receipt is present, call <code>verifyBundleAttestation(bundle, &#123; nodeUrl &#125;)</code>.</li>
              </ol>
            </div>
          </section>

          {/* Local integrity */}
          <section id="local-integrity">
            <h2>Local Integrity Verification</h2>
            <p>
              Local verification re-computes all hashes from the bundle's data and compares them to the recorded values.
              No network call is needed. This works entirely offline.
            </p>

            <div className="spec-code">
              <code>
{`import { verify } from '@nexart/ai-execution';
// or for Code Mode:
// import { verify } from '@nexart/codemode-sdk';

const bundle = JSON.parse(fs.readFileSync('record.cer.json', 'utf8'));
const result = verify(bundle);

if (result.ok) {
  console.log('✓ Record intact — hashes match');
} else {
  console.log('✗ Integrity breach:', result.code);
  console.log('  Details:', result.details);
}`}
              </code>
            </div>

            <p>What gets checked:</p>
            <ul>
              <li><code>certificateHash</code> — SHA-256 of canonical JSON of <code>&#123; bundleType, version, createdAt, snapshot &#125;</code></li>
              <li><code>inputHash</code> — SHA-256 of the input field</li>
              <li><code>outputHash</code> — SHA-256 of the output field</li>
              <li>Schema validity — correct <code>bundleType</code>, <code>version</code>, required fields present</li>
            </ul>
          </section>

          {/* Node stamp */}
          <section id="node-stamp">
            <h2>Node Stamp Verification</h2>
            <p>
              If the bundle includes a signed receipt (from a canonical attestation node), you can verify the Ed25519
              signature offline. The only network call is fetching the node's public keys.
            </p>

            <div className="spec-code">
              <code>
{`import { verifyBundleAttestation } from '@nexart/ai-execution';

const result = await verifyBundleAttestation(bundle, {
  nodeUrl: 'https://nexart-canonical-renderer-production.up.railway.app',
});

console.log(result.ok);   // true or false
console.log(result.code); // "OK", "ATTESTATION_INVALID_SIGNATURE", etc.`}
              </code>
            </div>

            <p>This performs the following automatically:</p>
            <ol>
              <li>Extracts the signed receipt and signature from the bundle</li>
              <li>Cross-checks <code>receipt.certificateHash === bundle.certificateHash</code> (prevents receipt-swapping)</li>
              <li>Fetches the node's public keys from <code>/.well-known/nexart-node.json</code></li>
              <li>Selects the correct key by <code>kid</code> or <code>activeKid</code></li>
              <li>Verifies the Ed25519 signature over the canonical JSON bytes of the receipt</li>
            </ol>
          </section>

          {/* Browser vs Server */}
          <section id="browser-vs-server">
            <h2>Browser vs Server Verification</h2>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Environment</th>
                    <th>SHA-256</th>
                    <th>Ed25519</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Browser</td>
                    <td><code>crypto.subtle.digest</code></td>
                    <td><code>crypto.subtle.verify</code></td>
                    <td>Works in all modern browsers via Web Crypto API</td>
                  </tr>
                  <tr>
                    <td>Node.js</td>
                    <td><code>crypto.createHash</code></td>
                    <td><code>crypto.verify</code></td>
                    <td>Built-in, no dependencies needed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              The SDK handles this automatically — <code>verify()</code> and <code>verifyBundleAttestation()</code> work
              in both environments without configuration.
            </p>

            <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
              <p className="text-sm text-muted-foreground mb-0">
                <strong>Recânon:</strong> For a zero-setup browser verification experience, upload your CER JSON to{" "}
                <a href="https://recanon.xyz" target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-2 hover:text-foreground">recanon.xyz</a>.
                Verification runs entirely in your browser — no data is sent to any server.
              </p>
            </div>
          </section>

          {/* Stamp incomplete */}
          <section id="stamp-incomplete">
            <h2>What "Stamp Incomplete" Means</h2>
            <p>
              A bundle may have been attested but lack the full signed receipt fields introduced in v0.5.0.
              This is not an error — it means the bundle was attested under an earlier SDK version.
            </p>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Fields Present</th>
                    <th>Status</th>
                    <th>What You Can Verify</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>receipt</code> + <code>signature</code> + <code>attestorKeyId</code></td>
                    <td>Fully signed</td>
                    <td>Local integrity + node signature</td>
                  </tr>
                  <tr>
                    <td><code>attestationId</code> + <code>nodeRuntimeHash</code> (no signature)</td>
                    <td>Legacy attestation</td>
                    <td>Local integrity only</td>
                  </tr>
                  <tr>
                    <td>No attestation fields</td>
                    <td>Not attested</td>
                    <td>Local integrity only</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <code>verifyBundleAttestation()</code> returns <code>ATTESTATION_MISSING</code> when no signed receipt is found.
              This does not invalidate the bundle itself — local integrity can still pass.
            </p>
          </section>

          {/* Next steps */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/docs/certification/node-stamps"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              Node Stamps & Keys →
            </Link>
            <Link
              to="/docs/certification/code-mode"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              Code Mode Certification →
            </Link>
          </div>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default VerifyIndependently;
