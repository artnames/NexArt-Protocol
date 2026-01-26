import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const RendererAPI = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Renderer API — NexArt Protocol</title>
        <meta
          name="description"
          content="NexArt Canonical Renderer API documentation — endpoints, authentication, and response handling."
        />
      </Helmet>

      <PageHeader
        title="Canonical Renderer API"
        subtitle="HTTP API for programmatic access to the canonical renderer."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
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

          <h2>Request Body</h2>

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
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>code</code></td>
                  <td>string</td>
                  <td>The generative sketch code</td>
                </tr>
                <tr>
                  <td><code>seed</code></td>
                  <td>string</td>
                  <td>Random seed for deterministic output</td>
                </tr>
                <tr>
                  <td><code>VAR</code></td>
                  <td>number[]</td>
                  <td>Array of 10 variable values (VAR[0..9])</td>
                </tr>
                <tr>
                  <td><code>protocolVersion</code></td>
                  <td>string</td>
                  <td>Protocol version (currently "1.2.0")</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Response</h2>

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
                  <td>Protocol version used for rendering</td>
                </tr>
                <tr>
                  <td><code>x-sdk-version</code></td>
                  <td>SDK version used for execution</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Error Codes</h2>

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
