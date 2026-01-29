import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const BuildersQuickstart = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <Helmet>
        <title>Quickstart — NexArt Builders</title>
        <meta
          name="description"
          content="Get your first certified run in under 5 minutes. Install the CLI, authenticate, run a sketch, and verify the snapshot."
        />
      </Helmet>

      <PageHeader
        title="Quickstart"
        subtitle="Get your first certified run in under 5 minutes."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          {/* Step 1: Install */}
          <h2>1. Install the CLI</h2>
          <p>
            No installation required. Run directly via <code>npx</code>:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 --help</code>
          </div>

          {/* Step 2: Get API Key */}
          <h2>2. Get an API Key</h2>
          <p>
            Create an API key in the dashboard. You'll need it to authenticate with the canonical renderer.
          </p>
          <div className="bg-muted/50 border border-border rounded-md p-4 my-4">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Note:</strong> API keys are used for authentication and environment separation only. 
              They do not carry quota. Quota is enforced at the account level.
            </p>
            <p className="text-sm text-muted-foreground mb-0">
              <strong>Key limits:</strong> Free includes 2 API keys. Pro includes 5. Pro+ includes 10. Enterprise is contract-defined.
            </p>
          </div>
          <div className="my-6">
            <Button asChild>
              <Link to={user ? "/dashboard/api-keys" : "/auth"}>
                {user ? "Go to API Keys" : "Sign In to Get API Key"}
              </Link>
            </Button>
          </div>

          {/* Step 3: Run */}
          <h2>3. Run a certified example</h2>
          <p>
            Set your environment variables and execute a sketch:
          </p>
          <div className="spec-code">
            <code>
              export NEXART_RENDERER_ENDPOINT="https://nexart-canonical-renderer-production.up.railway.app"{"\n"}
              export NEXART_API_KEY="nx_live_..."{"\n\n"}
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
            </ul>
          </div>
          <p>This produces:</p>
          <ul>
            <li><code>out.png</code> — rendered image at canonical resolution</li>
            <li><code>out.snapshot.json</code> — verifiable snapshot with hashes</li>
          </ul>

          {/* Step 4: Verify */}
          <h2>4. Verify the snapshot</h2>
          <p>
            Confirm the render is deterministic and untampered:
          </p>
          <div className="spec-code">
            <code>npx --yes @nexart/cli@0.2.3 verify out.snapshot.json</code>
          </div>
          <p>
            A successful verification proves the output hash matches a re-render with identical parameters.
          </p>

          {/* HTTP API note */}
          <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>HTTP API:</strong> If you call the HTTP API directly, include <code>protocolVersion</code> for audit stability. 
              If omitted, the service will default to its current version and report the resolved version in headers 
              (<code>x-protocol-version</code>, <code>x-protocol-defaulted: true</code>).
            </p>
          </div>

          {/* Callout */}
          <div className="spec-warning">
            <p className="spec-warning-title">Canvas size</p>
            <p>
              The canonical renderer enforces a fixed canvas size (<strong>1950×2400</strong>).
            </p>
            <p>
              Do not call <code>createCanvas()</code> or pass custom width/height.
            </p>
          </div>

          {/* Next Steps */}
          <h2>Next steps</h2>
          <ul>
            <li><Link to="/builders/cli" className="text-link hover:text-link-hover underline underline-offset-2">CLI Reference</Link> — Full command documentation</li>
            <li><Link to="/builders/certification" className="text-link hover:text-link-hover underline underline-offset-2">Canonical Certification</Link> — What certification means</li>
            <li><Link to="/builders" className="text-link hover:text-link-hover underline underline-offset-2">SDKs</Link> — Integration options for builders</li>
          </ul>
        </article>

        <div className="flex gap-3 mt-12 pt-8 border-t border-border">
          <Button asChild>
            <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get API Key</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/builders/cli">CLI Reference</Link>
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default BuildersQuickstart;
