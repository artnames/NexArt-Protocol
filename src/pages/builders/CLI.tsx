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
        <title>NexArt CLI — Builders</title>
        <meta
          name="description"
          content="Run deterministic Code Mode sketches using the canonical renderer. Get a PNG and auditable snapshot you can verify and replay."
        />
      </Helmet>

      <PageHeader
        title="NexArt CLI"
        subtitle="Run Code Mode sketches using the canonical remote renderer. Get a deterministic PNG plus an auditable snapshot you can verify and replay."
      />

      <PageContent>
        <div className="flex gap-3 mb-12">
          <Button asChild>
            <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get API Key</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/protocol">Read the Protocol</Link>
          </Button>
        </div>

        <article className="prose-protocol prose-spec">
          {/* Install */}
          <h2>1. Install</h2>
          <p>
            No installation required. Run the CLI directly via <code>npx</code>:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 --help</code>
          </div>

          {/* Auth Setup */}
          <h2>2. Authenticate</h2>
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
            <p className="spec-note-title">API key format</p>
            <ul>
              <li>Use the raw key starting with <code>nx_live_...</code></li>
              <li>Do NOT use the hashed (sha256) version — that's stored server-side only.</li>
            </ul>
          </div>

          {/* Run + Verify */}
          <h2>3. Run a certified render</h2>
          <p>
            Execute a sketch and receive a canonical PNG plus verifiable snapshot:
          </p>
          <div className="spec-code">
            <code>
              npx --yes @nexart/cli@0.2.3 nexart run ./examples/sketch.js \{"\n"}
              {"  "}--seed 12345 \{"\n"}
              {"  "}--vars "50,50,50,0,0,0,0,0,0,0" \{"\n"}
              {"  "}--include-code \{"\n"}
              {"  "}--out ./out.png
            </code>
          </div>
          <p>This produces:</p>
          <ul>
            <li><code>out.png</code> — rendered image at canonical resolution (1950×2400)</li>
            <li><code>out.snapshot.json</code> — deterministic snapshot with hashes and metadata</li>
          </ul>

          <h2>4. Verify a snapshot</h2>
          <p>
            Re-render with the same parameters and confirm the <code>outputHash</code> matches:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 nexart verify ./out.snapshot.json</code>
          </div>

          <h2>5. Replay a snapshot</h2>
          <p>
            Reproduce the image from a snapshot without re-verification:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 nexart replay ./out.snapshot.json --out ./replay.png</code>
          </div>

          {/* Canonical Size */}
          <h2>6. Canonical size rules</h2>
          <div className="spec-warning">
            <p className="spec-warning-title">Important</p>
            <ul>
              <li>Canonical renderer enforces <strong>1950 × 2400</strong>.</li>
              <li>Do not pass custom width/height to the canonical endpoint.</li>
              <li>Do not call <code>createCanvas()</code> inside sketches — the renderer provides the canvas.</li>
            </ul>
          </div>

          {/* Common Errors */}
          <h2>7. Common errors</h2>

          <h3>401 UNAUTHORIZED</h3>
          <p><strong>Cause:</strong> Missing <code>Authorization: Bearer &lt;api_key&gt;</code></p>
          <p><strong>Fix:</strong> Set <code>NEXART_API_KEY</code> environment variable or pass <code>--api-key</code></p>

          <h3>400 PROTOCOL_VIOLATION: "Canvas width must be 1950"</h3>
          <p><strong>Cause:</strong> Passing custom width/height or calling <code>createCanvas()</code></p>
          <p><strong>Fix:</strong> Remove width/height parameters. Let the renderer provide the canvas.</p>

          <h3>429 TOO MANY REQUESTS</h3>
          <p><strong>Cause:</strong> Rate limit exceeded (monthly quota or burst limit)</p>
          <p><strong>Fix:</strong> Wait and retry, or upgrade your plan for higher limits.</p>

          <h3>410 GONE when calling /render</h3>
          <p><strong>Cause:</strong> <code>/render</code> is disabled in production</p>
          <p><strong>Fix:</strong> Use <code>/api/render</code> with API key authentication.</p>

          <h3>"Unexpected token … PNG is not valid JSON"</h3>
          <p><strong>Cause:</strong> <code>/api/render</code> returns PNG bytes by default</p>
          <p><strong>Fix:</strong> Use <code>arrayBuffer()</code>/<code>blob()</code> in fetch, or set <code>Accept: application/json</code> header.</p>

          {/* API Reference */}
          <h2>8. API reference (for builders)</h2>
          <p>
            <code>POST /api/render</code> returns PNG bytes by default. 
            Set <code>Accept: application/json</code> to receive JSON.
          </p>

          <h3>PNG response (default)</h3>
          <div className="spec-code">
            <code>
              BASE="https://nexart-canonical-renderer-production.up.railway.app"{"\n"}
              KEY="nx_live_..."{"\n\n"}
              curl -sS -D /tmp/headers.txt -o out.png \{"\n"}
              {"  "}-X POST "$BASE/api/render" \{"\n"}
              {"  "}-H "Authorization: Bearer $KEY" \{"\n"}
              {"  "}-H "Content-Type: application/json" \{"\n"}
              {"  "}-d '&#123;"code":"function setup()&#123; background(50); ellipse(width/2,height/2,800); &#125;","seed":"test","VAR":[50,50,50,0,0,0,0,0,0,0],"protocolVersion":"1.2.0"&#125;'
            </code>
          </div>

          <h3>JSON response</h3>
          <div className="spec-code">
            <code>
              curl -sS "$BASE/api/render" \{"\n"}
              {"  "}-H "Authorization: Bearer $KEY" \{"\n"}
              {"  "}-H "Content-Type: application/json" \{"\n"}
              {"  "}-H "Accept: application/json" \{"\n"}
              {"  "}-d '&#123;"code":"function setup()&#123; background(50); &#125;","seed":"test","VAR":[0,0,0,0,0,0,0,0,0,0],"protocolVersion":"1.2.0"&#125;'
            </code>
          </div>
        </article>

        <div className="flex gap-3 mt-12 pt-8 border-t border-border">
          <Button asChild>
            <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get API Key</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/protocol">Read the Protocol</Link>
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default BuildersCLI;
