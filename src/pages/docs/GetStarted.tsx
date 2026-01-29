import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const GetStarted = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Get Started — NexArt Protocol</title>
        <meta
          name="description"
          content="Get started with NexArt — a deterministic rendering protocol for reproducible, verifiable generative output."
        />
      </Helmet>

      <PageHeader
        title="Get Started with NexArt"
        subtitle="Deterministic rendering for reproducible, verifiable generative output."
      />

      <PageContent>
        <article className="prose-protocol">
          <p>
            NexArt is a deterministic rendering protocol designed for reproducibility and verification. 
            It ensures that the same input — code, seed, and parameters — always produces the exact same output, 
            regardless of where or when it is rendered.
          </p>

          <p>
            The protocol is enforced through a canonical renderer: a remote service that executes generative 
            code in a controlled environment and produces cryptographically verifiable outputs. Every render 
            generates a snapshot containing hashes, metadata, and optionally the source code itself.
          </p>

          <p>
            This architecture enables trustless verification. Given a snapshot, anyone can re-run the render 
            and confirm the output matches — proving that the artwork was created exactly as claimed.
          </p>

          <h2>Quick Start</h2>

          <p>
            The NexArt CLI provides the fastest way to render and verify generative artwork. 
            No installation is required — run directly via <code>npx</code>.
          </p>

          <div className="spec-code">
            <code>
              <span className="text-caption"># Run without installing (recommended)</span>{"\n"}
              npx @nexart/cli run ./examples/sketch.js --seed 12345 --include-code --out out.png{"\n"}
              {"\n"}
              <span className="text-caption"># Verify determinism</span>{"\n"}
              npx @nexart/cli verify out.snapshot.json
            </code>
          </div>

          <p>
            The CLI communicates with the remote canonical renderer. Outputs are deterministic and verifiable — 
            the same command with the same inputs will always produce identical results.
          </p>

          <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>HTTP API:</strong> If you call the HTTP API directly, include <code>protocolVersion</code> for audit stability. 
              If omitted, the service will default to its current version and report the resolved version in response headers.
            </p>
          </div>

          <h2>What You Get</h2>

          <ul>
            <li><strong>out.png</strong> — The rendered image at canonical resolution (1950×2400)</li>
            <li><strong>out.snapshot.json</strong> — Deterministic snapshot with hashes, metadata, and verification data (always includes resolved <code>protocolVersion</code>)</li>
          </ul>

          <h2>Next Steps</h2>

          <p>
            Read the full CLI documentation to understand authentication, canonical rules, and verification workflows.
          </p>

          <div className="mt-8">
            <Link
              to="/docs/cli"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              Read CLI Documentation →
            </Link>
          </div>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default GetStarted;
