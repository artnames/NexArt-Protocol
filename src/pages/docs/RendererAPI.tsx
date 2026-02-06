import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const RendererAPI = () => {
  return (
    <PageLayout>
      <SEOHead 
        title="Renderer API"
        description="NexArt Canonical Renderer API documentation — endpoints, authentication, and response handling."
      />

      <PageHeader
        title="Canonical Renderer API"
        subtitle="HTTP API for programmatic access to the canonical renderer."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* Quick links */}
          <nav className="mb-8 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2">On this page:</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <li><a href="#request-format" className="text-link hover:text-link-hover underline underline-offset-2">Request Format</a></li>
              <li><a href="#protocol-version" className="text-link hover:text-link-hover underline underline-offset-2">Protocol Version</a></li>
              <li><a href="#account-level-quotas" className="text-link hover:text-link-hover underline underline-offset-2">Quotas</a></li>
              <li><a href="#response" className="text-link hover:text-link-hover underline underline-offset-2">Response</a></li>
              <li><a href="#png-vs-snapshot" className="text-link hover:text-link-hover underline underline-offset-2">PNG vs Snapshot</a></li>
              <li><a href="#error-codes" className="text-link hover:text-link-hover underline underline-offset-2">Error Codes</a></li>
            </ul>
          </nav>

          <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm">
              <strong>For AI agents and automated tools:</strong> See the{" "}
              <Link to="/docs/ai-agent-contract" className="text-link hover:text-link-hover underline underline-offset-2">
                AI Agent Contract
              </Link>{" "}
              for unambiguous API semantics optimized for programmatic clients.
            </p>
          </div>

          <h2>Endpoint</h2>

          <div className="spec-code">
            <code>POST /api/render</code>
          </div>

          <h2>Authentication</h2>

          <p>
            All requests require a valid API key passed in the <code>Authorization</code> header:
          </p>

          <div className="spec-code">
            <code>Authorization: Bearer nx_live_...</code>
          </div>

          <h2 id="request-format">Request Format</h2>

          <p>
            Send a JSON payload with the following structure:
          </p>

          <div className="spec-code">
            <code>
{`{
  "code": "function setup() { background(50); }",
  "seed": "12345",
  "VAR": [50,50,50,0,0,0,0,0,0,0],
  "protocolVersion": "1.2.0"
}`}
            </code>
          </div>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>code</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>The generative sketch code</td>
                </tr>
                <tr>
                  <td><code>seed</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>Random seed for deterministic output</td>
                </tr>
                <tr>
                  <td><code>VAR</code></td>
                  <td>number[]</td>
                  <td>Yes</td>
                  <td>Array of 10 variable values (VAR[0..9])</td>
                </tr>
                <tr>
                  <td><code>protocolVersion</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Protocol version (defaults to current if omitted)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="protocol-version">Protocol Version</h2>
          <p className="text-caption text-sm mb-4">Required for audits, optional in requests</p>

          <p>
            <strong>Recommended:</strong> Clients should always send <code>protocolVersion</code> for audit stability and reproducibility.
          </p>

          <p>
            <strong>If omitted:</strong> The canonical renderer defaults to its current protocol version and proceeds with the render.
          </p>

          <ul>
            <li>The resolved version is returned in the response header: <code>x-protocol-version</code></li>
            <li>When defaulted, the response includes: <code>x-protocol-defaulted: true</code></li>
            <li>Snapshots (CLI output) always record the resolved <code>protocolVersion</code> for reproducibility</li>
          </ul>

          <div className="spec-warning">
            <p className="spec-warning-title">Audit Stability</p>
            <p>
              For archival, minting, or any use case requiring long-term reproducibility, 
              always include <code>protocolVersion</code> explicitly. This ensures your 
              renders are pinned to a specific protocol version regardless of future 
              renderer updates.
            </p>
          </div>

          <h2 id="account-level-quotas">Account-Level Quotas & Enforcement</h2>

          <p>
            Certified renders are subject to account-level monthly quotas enforced by the NexArt Canonical Renderer.
          </p>

          <ul>
            <li>Quotas apply per account, not per API key</li>
            <li>All active API keys under the same account share the same monthly limit</li>
            <li>Creating additional API keys does not increase quota</li>
            <li>Only successful certified renders (HTTP 200 from <code>/api/render</code>) count toward usage</li>
            <li>Quota is checked before rendering begins</li>
            <li>When the quota is exceeded, the renderer returns HTTP <code>429</code> and does not render</li>
          </ul>

          <h3>Quota Headers</h3>

          <p>
            Each successful render response includes quota headers:
          </p>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>X-Quota-Limit</code></td>
                  <td>Monthly quota for the account</td>
                </tr>
                <tr>
                  <td><code>X-Quota-Used</code></td>
                  <td>Number of certified renders used this month</td>
                </tr>
                <tr>
                  <td><code>X-Quota-Remaining</code></td>
                  <td>Remaining certified renders for the current month</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="response">Response</h2>

          <p>
            A successful response returns a binary PNG image:
          </p>

          <ul>
            <li><strong>Content-Type:</strong> <code>image/png</code></li>
            <li><strong>Body:</strong> Binary PNG data</li>
          </ul>

          <h3>Response Headers</h3>

          <p>
            The response includes verification headers:
          </p>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>x-runtime-hash</code></td>
                  <td>Hash of the rendered output</td>
                </tr>
                <tr>
                  <td><code>x-protocol-version</code></td>
                  <td>Protocol version used for rendering (always present)</td>
                </tr>
                <tr>
                  <td><code>x-protocol-defaulted</code></td>
                  <td><code>true</code> if protocolVersion was omitted and defaulted</td>
                </tr>
                <tr>
                  <td><code>x-sdk-version</code></td>
                  <td>SDK version used for execution</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="png-vs-snapshot">PNG vs Snapshot</h2>
          <p className="text-caption text-sm mb-4">Why the canonical renderer returns PNG, not JSON</p>

          <p>
            The canonical renderer separates <strong>artifacts</strong> from <strong>proofs</strong>:
          </p>

          <ul>
            <li>
              <strong>PNG</strong> — The canonical artifact output. This is the rendered image 
              at canonical resolution (1950×2400). It is portable, viewable, and archivable 
              without special tooling.
            </li>
            <li>
              <strong>Snapshot (JSON)</strong> — The proof metadata that references the artifact. 
              Contains the artifact hash, input parameters, protocol version, runtime hash, 
              and timestamps. This is what makes verification possible.
            </li>
          </ul>

          <p>
            This separation keeps artifacts portable and proofs verifiable. The PNG can be 
            displayed, stored, or transmitted independently. The snapshot can be used to 
            verify authenticity by re-rendering and comparing hashes.
          </p>

          <div className="spec-code">
            <code>{`// Snapshot structure
{
  "protocolVersion": "1.2.0",
  "seed": "12345",
  "VAR": [...],
  "codeHash": "sha256:...",
  "outputHash": "sha256:...",
  "timestamp": "2025-01-27T..."
}`}</code>
          </div>

          <h2 id="error-codes">Error Codes</h2>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>400</code></td>
                  <td>Protocol violation (e.g., wrong canvas size)</td>
                </tr>
                <tr>
                  <td><code>401</code></td>
                  <td>Missing or invalid API key</td>
                </tr>
                <tr>
                  <td><code>403</code></td>
                  <td>API key disabled or quota exceeded</td>
                </tr>
                <tr>
                  <td><code>410</code></td>
                  <td>Using deprecated <code>/render</code> endpoint in production</td>
                </tr>
                <tr>
                  <td><code>429</code></td>
                  <td>Rate limited</td>
                </tr>
                <tr>
                  <td><code>503</code></td>
                  <td>Metering required but database unavailable</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-warning">
            <p className="spec-warning-title">Important</p>
            <p>
              The <code>/api/render</code> endpoint returns binary PNG data, not JSON. 
              Clients must handle the response as a blob, arrayBuffer, or file download.
            </p>
            <p>
              Do NOT call <code>response.json()</code> on this endpoint.
            </p>
          </div>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default RendererAPI;
