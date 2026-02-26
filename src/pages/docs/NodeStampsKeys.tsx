import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const NodeStampsKeys = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Node Stamps & Keys | NexArt"
        description="How NexArt attestation receipts are signed, how verifiers fetch public keys, and how key rotation works."
      />

      <PageHeader
        title="Node Stamps & Keys"
        subtitle="How receipts are signed and how verifiers fetch keys."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* On-page navigation */}
          <nav className="mb-10 pb-6 border-b border-border">
            <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">On this page</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm list-none pl-0">
              <li><a href="#minimum-integration" className="text-body underline underline-offset-2 hover:text-foreground">Minimum Integration</a></li>
              <li><a href="#receipt-fields" className="text-body underline underline-offset-2 hover:text-foreground">Receipt Fields</a></li>
              <li><a href="#node-keys-endpoint" className="text-body underline underline-offset-2 hover:text-foreground">Node Keys Endpoint</a></li>
              <li><a href="#key-rotation" className="text-body underline underline-offset-2 hover:text-foreground">Key Rotation</a></li>
              <li><a href="#troubleshooting" className="text-body underline underline-offset-2 hover:text-foreground">Troubleshooting</a></li>
            </ul>
          </nav>

          {/* Minimum integration box */}
          <section id="minimum-integration">
            <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
              <p className="text-xs font-mono uppercase tracking-wide text-caption mb-3">Minimum Integration — 3 Steps</p>
              <ol className="text-sm text-body space-y-2 pl-5 mb-0">
                <li><strong>Extract receipt</strong> — Use <code>getAttestationReceipt(bundle)</code> to get the normalized receipt.</li>
                <li><strong>Fetch node keys</strong> — Call <code>fetchNodeKeys(nodeUrl)</code> to get the public key document.</li>
                <li><strong>Verify signature</strong> — Use <code>verifyBundleAttestation(bundle, &#123; nodeUrl &#125;)</code> for the full check.</li>
              </ol>
            </div>
          </section>

          {/* Receipt fields */}
          <section id="receipt-fields">
            <h2>Receipt Fields</h2>
            <p>
              After a successful attestation, the bundle includes a normalized <code>AttestationReceipt</code>:
            </p>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>attestationId</code></td><td><code>string</code></td><td>Unique ID of this attestation event</td></tr>
                  <tr><td><code>certificateHash</code></td><td><code>string</code></td><td>Must match <code>bundle.certificateHash</code></td></tr>
                  <tr><td><code>nodeRuntimeHash</code></td><td><code>string</code></td><td>Hash of the node's runtime state at attestation time</td></tr>
                  <tr><td><code>protocolVersion</code></td><td><code>string</code></td><td>Protocol version the node used for verification</td></tr>
                  <tr><td><code>nodeId</code></td><td><code>string?</code></td><td>Identifier of the attestation node</td></tr>
                  <tr><td><code>attestedAt</code></td><td><code>string?</code></td><td>ISO 8601 timestamp of attestation</td></tr>
                  <tr><td><code>attestorKeyId</code></td><td><code>string?</code></td><td><code>kid</code> of the Ed25519 signing key (v0.5.0+)</td></tr>
                  <tr><td><code>signatureB64Url</code></td><td><code>string?</code></td><td>Base64url-encoded Ed25519 signature (v0.5.0+)</td></tr>
                </tbody>
              </table>
            </div>

            <div className="spec-code">
              <code>
{`import { getAttestationReceipt } from '@nexart/ai-execution';

const receipt = getAttestationReceipt(bundle);
if (receipt) {
  console.log(receipt.attestationId);
  console.log(receipt.attestorKeyId);    // "key-2025-01"
  console.log(receipt.signatureB64Url);  // "aDEKyu...Q"
}`}
              </code>
            </div>
          </section>

          {/* Node keys endpoint */}
          <section id="node-keys-endpoint">
            <h2>Node Keys Endpoint</h2>
            <p>
              Every attestation node publishes its public keys at a well-known URL:
            </p>

            <div className="spec-code">
              <code>
{`GET {nodeUrl}/.well-known/nexart-node.json`}
              </code>
            </div>

            <p>
              <strong>Live endpoint:</strong>{" "}
              <a
                href="https://nexart-canonical-renderer-production.up.railway.app/.well-known/nexart-node.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body underline underline-offset-2 hover:text-foreground break-all"
              >
                nexart-canonical-renderer-production.up.railway.app/.well-known/nexart-node.json
              </a>
            </p>

            <p>The document contains keys in two formats:</p>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Field</th>
                    <th>Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>JWK</td>
                    <td><code>key.jwk</code></td>
                    <td>Web Crypto API (<code>crypto.subtle.importKey</code>)</td>
                  </tr>
                  <tr>
                    <td>SPKI (Base64)</td>
                    <td><code>key.spkiB64</code></td>
                    <td>Node.js <code>crypto.createPublicKey</code></td>
                  </tr>
                  <tr>
                    <td>Raw (Base64url)</td>
                    <td><code>key.rawB64Url</code></td>
                    <td>Direct 32-byte Ed25519 public key</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="spec-code">
              <code>
{`import { fetchNodeKeys, selectNodeKey } from '@nexart/ai-execution';

const doc = await fetchNodeKeys(
  'https://nexart-canonical-renderer-production.up.railway.app'
);

// Select key by kid (from receipt.attestorKeyId)
const { key } = selectNodeKey(doc, receipt.attestorKeyId);
console.log(key.jwk);
// { kty: "OKP", crv: "Ed25519", x: "<base64url>" }`}
              </code>
            </div>
          </section>

          {/* Key rotation */}
          <section id="key-rotation">
            <h2>Key Rotation</h2>
            <p>
              The node keys document includes an <code>activeKid</code> field indicating which key is currently used for
              new attestations. Older keys remain in the document so historical receipts can still be verified.
            </p>

            <ul>
              <li><code>activeKid</code> — The <code>kid</code> of the key used for new attestations</li>
              <li>Historical keys remain listed with their <code>kid</code> for backward-compatible verification</li>
              <li><code>selectNodeKey(doc)</code> defaults to <code>activeKid</code> when no <code>kid</code> is specified</li>
              <li>When verifying an old receipt, pass its <code>attestorKeyId</code> to <code>selectNodeKey(doc, kid)</code></li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting">
            <h2>Troubleshooting</h2>

            <div className="overflow-x-auto my-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Symptom</th>
                    <th>Code</th>
                    <th>Cause</th>
                    <th>Fix</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>No receipt in bundle</td>
                    <td><code>ATTESTATION_MISSING</code></td>
                    <td>Bundle was never attested, or attested before v0.5.0</td>
                    <td>Re-attest with current SDK, or accept local-only verification</td>
                  </tr>
                  <tr>
                    <td>Signature fails</td>
                    <td><code>ATTESTATION_INVALID_SIGNATURE</code></td>
                    <td>Receipt was modified after signing</td>
                    <td>Obtain a fresh copy of the bundle</td>
                  </tr>
                  <tr>
                    <td>Key not found</td>
                    <td><code>ATTESTATION_KEY_NOT_FOUND</code></td>
                    <td>The <code>kid</code> in the receipt doesn't match any key in the node document</td>
                    <td>Check you're querying the correct node URL; key may have been retired</td>
                  </tr>
                  <tr>
                    <td>Key format unsupported</td>
                    <td><code>ATTESTATION_KEY_FORMAT_UNSUPPORTED</code></td>
                    <td>Key has wrong <code>crv</code> or missing fields</td>
                    <td>Report to node operator — key document is malformed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
              <p className="text-sm text-muted-foreground mb-0">
                <strong>"Stamp incomplete"</strong> is not an error. It means the bundle has legacy attestation fields
                (pre-v0.5.0) without a signed receipt. Local integrity verification still works — only the node
                signature check is unavailable.
              </p>
            </div>
          </section>

          {/* Next steps */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/docs/certification/code-mode"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              ← Code Mode Certification
            </Link>
            <Link
              to="/docs/certification/ai-execution"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              ← AI Execution Certification
            </Link>
          </div>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default NodeStampsKeys;
