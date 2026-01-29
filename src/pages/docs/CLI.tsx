import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const CLI = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>CLI Documentation — NexArt Protocol</title>
        <meta
          name="description"
          content="NexArt CLI documentation — install, render, and verify deterministic generative artwork."
        />
      </Helmet>

      <PageHeader
        title="NexArt CLI"
        subtitle="Command-line interface for deterministic rendering and verification."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          <h2>Installation</h2>

          <p>
            No installation is required. Run the CLI directly via <code>npx</code>:
          </p>

          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 --help</code>
          </div>

          <h2>Environment Variables</h2>

          <p>
            Configure the CLI by setting the following environment variables:
          </p>

          <div className="spec-code">
            <code>
              export NEXART_RENDERER_ENDPOINT=https://nexart-canonical-renderer-production.up.railway.app{"\n"}
              export NEXART_API_KEY=nx_live_...
            </code>
          </div>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>NEXART_RENDERER_ENDPOINT</code></td>
                  <td>URL of the canonical renderer service</td>
                </tr>
                <tr>
                  <td><code>NEXART_API_KEY</code></td>
                  <td>API key for authenticated rendering (required)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Running a Sketch</h2>

          <p>
            Use the <code>run</code> command to render a sketch:
          </p>

          <div className="spec-code">
            <code>
              npx --yes @nexart/cli@0.2.3 run ./examples/sketch.js \{"\n"}
              {"  "}--seed 12345 \{"\n"}
              {"  "}--vars "50,50,50,0,0,0,0,0,0,0" \{"\n"}
              {"  "}--include-code \{"\n"}
              {"  "}--out out.png
            </code>
          </div>

          <div className="spec-note">
            <p className="spec-note-title">Important</p>
            <ul>
              <li>The canonical renderer returns a <strong>PNG</strong> (<code>image/png</code>), not JSON.</li>
              <li>Canonical size is enforced at <strong>1950×2400</strong>. Do not pass <code>width</code>/<code>height</code> and do not call <code>createCanvas()</code>.</li>
              <li>If <code>protocolVersion</code> is omitted, the renderer defaults to <code>1.2.0</code> and returns <code>X-Protocol-Defaulted: true</code>.</li>
            </ul>
          </div>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Flag</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>--seed</code></td>
                  <td>Random seed for deterministic output</td>
                </tr>
                <tr>
                  <td><code>--vars</code></td>
                  <td>Comma-separated values mapped to <code>VAR[0..9]</code></td>
                </tr>
                <tr>
                  <td><code>--include-code</code></td>
                  <td>Embed source code in the snapshot</td>
                </tr>
                <tr>
                  <td><code>--out</code></td>
                  <td>Output filename (without extension)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Verifying Output</h2>

          <p>
            Use the <code>verify</code> command to confirm determinism:
          </p>

          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 verify out.snapshot.json</code>
          </div>

          <p>
            Verification re-runs the sketch with the same parameters and confirms that the output hash matches 
            the original. A successful verification proves the render is deterministic and untampered.
          </p>

          <div className="spec-warning">
            <p className="spec-warning-title">Canonical Renderer Rules</p>
            <ul>
              <li>Canvas size is fixed at <strong>1950 × 2400</strong></li>
              <li>Do NOT call <code>createCanvas()</code></li>
              <li>Do NOT pass custom width or height</li>
              <li>Use <code>setup()</code> only — no animation loops</li>
              <li>Use <code>random()</code> for controlled randomness</li>
            </ul>
            <p>
              Violating these rules will result in a protocol error or non-canonical output.
            </p>
          </div>

          <h2>Output Files</h2>

          <p>
            A successful render produces two files:
          </p>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>out.png</code></td>
                  <td>Rendered image at canonical resolution</td>
                </tr>
                <tr>
                  <td><code>out.snapshot.json</code></td>
                  <td>Deterministic snapshot with hashes and metadata</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Common Pitfall: PNG Response Parsing</h2>

          <p>
            If you encounter this error:
          </p>

          <div className="spec-code">
            <code>"Unexpected token '�PNG' is not valid JSON"</code>
          </div>

          <p>
            This error occurs when treating a PNG response as JSON. The <code>/api/render</code> endpoint 
            returns binary PNG data, not JSON.
          </p>

          <p>
            Clients must handle the response as:
          </p>

          <ul>
            <li><code>blob</code></li>
            <li><code>arrayBuffer</code></li>
            <li>or file download</li>
          </ul>

          <p>
            Do NOT call <code>response.json()</code> on the render endpoint. This error is caused by 
            treating a PNG response as JSON.
          </p>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default CLI;
