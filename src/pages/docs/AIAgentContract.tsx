import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Link } from "react-router-dom";

const AIAgentContract = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>AI Agent Contract — NexArt Protocol</title>
        <meta
          name="description"
          content="NexArt Canonical Renderer contract for AI agents, CI systems, and programmatic clients. Unambiguous API semantics for automated execution."
        />
      </Helmet>

      <PageHeader
        title="NexArt Canonical Renderer — AI Agent Contract"
        subtitle="Unambiguous API semantics for AI coding agents, CI systems, and programmatic clients."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* Critical notice */}
          <div className="spec-warning mb-8">
            <p className="spec-warning-title">Important</p>
            <p>
              The NexArt Canonical Renderer is not a free public service. All certified execution requires an authenticated account.
            </p>
          </div>

          {/* Quick links */}
          <nav className="mb-8 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2">On this page:</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <li><a href="#tldr" className="text-link hover:text-link-hover underline underline-offset-2">TL;DR for Agents</a></li>
              <li><a href="#execution-model" className="text-link hover:text-link-hover underline underline-offset-2">Execution Model</a></li>
              <li><a href="#api" className="text-link hover:text-link-hover underline underline-offset-2">Canonical Renderer API</a></li>
              <li><a href="#request" className="text-link hover:text-link-hover underline underline-offset-2">Request Payload</a></li>
              <li><a href="#output" className="text-link hover:text-link-hover underline underline-offset-2">Output Format</a></li>
              <li><a href="#artifact-vs-proof" className="text-link hover:text-link-hover underline underline-offset-2">Artifact vs Proof</a></li>
              <li><a href="#quotas" className="text-link hover:text-link-hover underline underline-offset-2">Quotas</a></li>
              <li><a href="#errors" className="text-link hover:text-link-hover underline underline-offset-2">Error Semantics</a></li>
              <li><a href="#free" className="text-link hover:text-link-hover underline underline-offset-2">What's Free</a></li>
              <li><a href="#rule" className="text-link hover:text-link-hover underline underline-offset-2">One-Line Rule</a></li>
            </ul>
          </nav>

          {/* TL;DR */}
          <h2 id="tldr">TL;DR for Agents</h2>

          <ul>
            <li><strong>Local execution is free.</strong> No account required.</li>
            <li><strong>Canonical renderer always requires an account + API key.</strong></li>
            <li><strong>There is no anonymous or public node.</strong></li>
            <li><strong>Output is binary PNG, not JSON.</strong></li>
            <li><strong>Certification is what is metered and billed.</strong></li>
          </ul>

          {/* Execution Model */}
          <h2 id="execution-model">Execution Model</h2>

          <p>NexArt supports two execution paths:</p>

          <h3>1. Local Deterministic Execution</h3>
          <ul>
            <li>Uses <code>@nexart/codemode-sdk</code> or <code>@nexart/cli</code></li>
            <li>Free, unlimited, no account required</li>
            <li>Deterministic output on your machine</li>
            <li>No network calls, no metering</li>
          </ul>

          <h3>2. Canonical Certified Execution</h3>
          <ul>
            <li>Uses <code>POST /api/render</code> on the canonical renderer</li>
            <li>Requires an authenticated account and valid API key</li>
            <li>Produces auditable, verifiable proof artifacts</li>
            <li>Metered against account quota</li>
          </ul>

          {/* Canonical Renderer API */}
          <h2 id="api">Canonical Renderer API</h2>

          <div className="spec-code">
            <code>POST /api/render</code>
          </div>

          <h3>Authentication</h3>

          <p>All requests require a valid API key:</p>

          <div className="spec-code">
            <code>Authorization: Bearer nx_live_...</code>
          </div>

          <p>
            <strong>All canonical access is authenticated.</strong> There is no public endpoint, no anonymous mode, and no way to render without a valid API key.
          </p>

          {/* Request Payload */}
          <h2 id="request">Request Payload (Strict)</h2>

          <div className="spec-code">
            <code>
{`{
  "code": "function setup() { background(50); }",
  "seed": "12345",
  "VAR": [50, 50, 50, 0, 0, 0, 0, 0, 0, 0],
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
                  <th>Notes</th>
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
                  <td>Exactly 10 values (VAR[0..9])</td>
                </tr>
                <tr>
                  <td><code>protocolVersion</code></td>
                  <td>string</td>
                  <td>Recommended</td>
                  <td>Defaults to current if omitted</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-warning">
            <p className="spec-warning-title">Recommendation</p>
            <p>
              Agents should always send <code>protocolVersion</code> explicitly. This ensures reproducibility and prevents output drift when the renderer updates.
            </p>
          </div>

          {/* Output Format */}
          <h2 id="output">Output Format (Critical)</h2>

          <ul>
            <li><strong>Content-Type:</strong> <code>image/png</code></li>
            <li><strong>Resolution:</strong> 1950×2400 pixels (fixed, non-configurable)</li>
            <li><strong>Body:</strong> Binary PNG data</li>
          </ul>

          <div className="spec-warning">
            <p className="spec-warning-title">Critical Warning</p>
            <p>
              Do <strong>NOT</strong> call <code>response.json()</code> on this endpoint. The response is binary image data, not JSON.
            </p>
          </div>

          <h3>Correct Handling (JavaScript)</h3>

          <div className="spec-code">
            <code>
{`const response = await fetch('/api/render', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer nx_live_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code, seed, VAR, protocolVersion })
});

// CORRECT: Handle as binary
const buffer = await response.arrayBuffer();
const blob = new Blob([buffer], { type: 'image/png' });

// WRONG: Do not do this
// const data = await response.json(); // ❌ Will throw error`}
            </code>
          </div>

          {/* Artifact vs Proof */}
          <h2 id="artifact-vs-proof">Artifact vs Proof</h2>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Format</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Artifact</strong></td>
                  <td>PNG (binary)</td>
                  <td>The rendered image at canonical resolution</td>
                </tr>
                <tr>
                  <td><strong>Proof</strong></td>
                  <td>Snapshot (JSON)</td>
                  <td>Metadata for verification: hashes, inputs, protocol version</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            The PNG is portable and viewable. The snapshot enables verification by re-rendering and comparing hashes.
          </p>

          <div className="spec-code">
            <code>
{`// Snapshot structure
{
  "protocolVersion": "1.2.0",
  "seed": "12345",
  "VAR": [...],
  "codeHash": "sha256:...",
  "outputHash": "sha256:...",
  "timestamp": "2025-01-27T..."
}`}
            </code>
          </div>

          {/* Quotas & Metering */}
          <h2 id="quotas">Quotas & Metering</h2>

          <ul>
            <li>Quotas are enforced at the <strong>account level</strong></li>
            <li>All API keys under one account <strong>share the same quota</strong></li>
            <li>Only <strong>successful renders</strong> (HTTP 200) count toward usage</li>
            <li>Quota is checked <strong>before</strong> rendering begins</li>
            <li>When quota is exceeded, the renderer returns <strong>HTTP 429</strong> and does not render</li>
          </ul>

          <h3>Quota Headers</h3>

          <p>Successful responses include:</p>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>X-Quota-Limit</code></td>
                  <td>Monthly quota for the account</td>
                </tr>
                <tr>
                  <td><code>X-Quota-Used</code></td>
                  <td>Renders used this month</td>
                </tr>
                <tr>
                  <td><code>X-Quota-Remaining</code></td>
                  <td>Renders remaining this month</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Error Semantics */}
          <h2 id="errors">Error Semantics</h2>

          <p>Stable HTTP status codes for programmatic handling:</p>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Meaning</th>
                  <th>Agent Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>400</code></td>
                  <td>Protocol violation (e.g., wrong canvas size, invalid VAR)</td>
                  <td>Fix request payload</td>
                </tr>
                <tr>
                  <td><code>401</code></td>
                  <td>Missing or invalid API key</td>
                  <td>Check Authorization header</td>
                </tr>
                <tr>
                  <td><code>403</code></td>
                  <td>API key disabled or account suspended</td>
                  <td>Contact account owner</td>
                </tr>
                <tr>
                  <td><code>429</code></td>
                  <td>Quota exceeded or rate limited</td>
                  <td>Wait or upgrade plan</td>
                </tr>
                <tr>
                  <td><code>503</code></td>
                  <td>Service temporarily unavailable</td>
                  <td>Retry with backoff</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* What NexArt Never Charges For */}
          <h2 id="free">What NexArt Never Charges For</h2>

          <ul>
            <li><code>@nexart/codemode-sdk</code> — Free</li>
            <li><code>@nexart/cli</code> — Free</li>
            <li>Local deterministic execution — Free</li>
            <li>Verification of existing snapshots — Free</li>
            <li>Reading documentation — Free</li>
          </ul>

          <p>
            <strong>Only certified renders via the canonical renderer are metered.</strong>
          </p>

          {/* One-Line Rule */}
          <h2 id="rule">One-Line Rule for Agents</h2>

          <div className="spec-warning">
            <p className="spec-warning-title">Rule</p>
            <p>
              <strong>If you need a verifiable proof that the output is canonical, call the canonical renderer with a valid API key. Otherwise, execute locally for free.</strong>
            </p>
          </div>

          {/* Related Documentation */}
          <h2>Related Documentation</h2>

          <ul>
            <li><Link to="/docs/renderer-api" className="text-link hover:text-link-hover underline underline-offset-2">Renderer API Reference</Link> — Full API documentation</li>
            <li><Link to="/docs/cli" className="text-link hover:text-link-hover underline underline-offset-2">CLI Documentation</Link> — Local execution commands</li>
            <li><Link to="/protocol-compliance" className="text-link hover:text-link-hover underline underline-offset-2">Protocol Compliance</Link> — Acceptance checklist for renderers</li>
            <li><Link to="/pricing" className="text-link hover:text-link-hover underline underline-offset-2">Pricing</Link> — Plan limits and certified run quotas</li>
          </ul>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default AIAgentContract;
