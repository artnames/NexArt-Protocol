import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const BuildersCLI = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <Helmet>
        <title>CLI Reference — NexArt Builders</title>
        <meta
          name="description"
          content="NexArt CLI reference. Install, authenticate, run certified renders, and verify snapshots."
        />
      </Helmet>

      <PageHeader
        title="CLI Reference"
        subtitle="Run certified renders and verify snapshots from the command line."
      />

      <PageContent>
        <div className="flex gap-3 mb-12">
          <Button asChild>
            <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get API Key</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/builders/quickstart">Quickstart</Link>
          </Button>
        </div>

        <article className="prose-protocol prose-spec">
          {/* Install */}
          <h2>Install</h2>
          <p>
            No installation required. Run directly via <code>npx</code>:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 --help</code>
          </div>
          <p>
            The CLI is available as <code>@nexart/cli</code> on npm.
          </p>

          {/* Authentication */}
          <h2>Authentication</h2>
          <p>
            The canonical renderer requires an API key. Set these environment variables:
          </p>
          <div className="spec-code">
            <code>
              export NEXART_RENDERER_ENDPOINT="https://nexart-canonical-renderer-production.up.railway.app"{"\n"}
              export NEXART_API_KEY="nx_live_..."
            </code>
          </div>
          <div className="spec-note">
            <p className="spec-note-title">Key format</p>
            <ul>
              <li>Use the raw key starting with <code>nx_live_...</code></li>
              <li>The hashed version (sha256) is stored server-side only</li>
            </ul>
          </div>

          {/* Certified Run */}
          <h2>Certified run</h2>
          <p>
            Execute a sketch and receive a canonical PNG plus verifiable snapshot:
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
          <p>Outputs:</p>
          <ul>
            <li><code>out.png</code> — rendered image at canonical resolution (1950×2400)</li>
            <li><code>out.snapshot.json</code> — deterministic snapshot with hashes</li>
          </ul>

          <h3>Options</h3>
          <table>
            <thead>
              <tr>
                <th>Flag</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>--seed</code></td>
                <td>Seed value for deterministic randomness</td>
              </tr>
              <tr>
                <td><code>--vars</code></td>
                <td>Comma-separated VAR array (10 values)</td>
              </tr>
              <tr>
                <td><code>--include-code</code></td>
                <td>Embed source code in snapshot</td>
              </tr>
              <tr>
                <td><code>--out</code></td>
                <td>Output file path</td>
              </tr>
              <tr>
                <td><code>--api-key</code></td>
                <td>API key (alternative to env var)</td>
              </tr>
            </tbody>
          </table>

          {/* Verification */}
          <h2>Verification</h2>
          <p>
            Verify that a snapshot matches its output:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 verify out.snapshot.json</code>
          </div>
          <p>
            Verification re-renders with the same parameters and confirms the <code>outputHash</code> matches.
          </p>

          <h3>Replay</h3>
          <p>
            Reproduce an image from a snapshot without re-verification:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 replay out.snapshot.json --out replay.png</code>
          </div>

          {/* Common Errors */}
          <h2>Common errors</h2>

          <h3>401 UNAUTHORIZED</h3>
          <p><strong>Cause:</strong> Missing or invalid API key</p>
          <p><strong>Fix:</strong> Set <code>NEXART_API_KEY</code> environment variable or pass <code>--api-key</code></p>

          <h3>400 PROTOCOL_VIOLATION</h3>
          <p><strong>Cause:</strong> Sketch calls <code>createCanvas()</code> or passes custom width/height</p>
          <p><strong>Fix:</strong> Remove canvas creation. The canonical renderer provides a 1950×2400 canvas.</p>
          <div className="spec-warning">
            <p className="spec-warning-title">Canvas size</p>
            <p>The canonical renderer enforces <strong>1950×2400</strong>. Do not call <code>createCanvas()</code>.</p>
          </div>

          <h3>429 TOO MANY REQUESTS</h3>
          <p><strong>Cause:</strong> Plan limit reached (monthly quota or burst limit)</p>
          <p><strong>Fix:</strong> Wait for quota reset or upgrade your plan. See <Link to="/pricing" className="text-link hover:text-link-hover underline underline-offset-2">pricing</Link>.</p>

          <h3>410 GONE</h3>
          <p><strong>Cause:</strong> Calling deprecated <code>/render</code> endpoint</p>
          <p><strong>Fix:</strong> Use <code>/api/render</code> with API key authentication</p>

          <h3>"PNG is not valid JSON"</h3>
          <p><strong>Cause:</strong> Parsing PNG bytes as JSON</p>
          <p><strong>Fix:</strong> Use <code>arrayBuffer()</code>/<code>blob()</code> in fetch, or set <code>Accept: application/json</code> header</p>

          {/* API Reference */}
          <h2>API reference</h2>
          <p>
            For direct API integration, see <Link to="/docs/renderer-api" className="text-link hover:text-link-hover underline underline-offset-2">Renderer API</Link>.
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

export default BuildersCLI;
