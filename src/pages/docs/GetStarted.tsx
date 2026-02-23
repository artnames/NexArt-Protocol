import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const GetStarted = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Get Started | Deterministic Execution and Verification"
        description="Get started with NexArt: deterministic execution semantics, canonical rendering, and hash-based verification for reproducible AI and generative outputs."
      />

      <PageHeader title="Get Started" subtitle="Deterministic execution, canonical outputs, and verifiable execution records." />

      <PageContent>
        <article className="prose-protocol">
          <p>
            NexArt is a deterministic execution protocol for AI and generative systems. Given the same code, seed, and
            parameters, a compliant runtime produces the same output under pinned semantics.
          </p>

          <p>
            NexArt supports canonical rendering for certification workflows. A canonical renderer executes the system in
            a controlled environment and returns an output artifact plus a snapshot that binds inputs and outputs using
            cryptographic hashes.
          </p>

          <p>
            Verification is hash-based. Given a snapshot, any party can re-render under the same protocol version and
            compare hashes to confirm the output matches the recorded run.
          </p>

          <h2>Quick start</h2>

          <p>
            The NexArt CLI is the fastest way to render and verify a system. No installation is required. Run it
            directly via <code>npx</code>.
          </p>

          <div className="spec-code">
            <code>
              <span className="text-caption"># Render (recommended)</span>
              {"\n"}
              npx --yes @nexart/cli@0.2.3 run ./examples/sketch.js --seed 12345 --include-code --out out.png
              {"\n\n"}
              <span className="text-caption"># Verify snapshot integrity</span>
              {"\n"}
              npx --yes @nexart/cli@0.2.3 verify out.snapshot.json
            </code>
          </div>

          <p>
            By default, the CLI uses the NexArt reference canonical renderer. Builders can also run their own compliant
            renderer for isolation, scaling, or internal infrastructure requirements.
          </p>

          <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>HTTP API:</strong> If you call the renderer API directly, include <code>protocolVersion</code> for
              audit stability. If omitted, the service resolves to its current default and reports the resolved version
              in response headers and the snapshot.
            </p>
          </div>

          <h2>What you get</h2>

          <ul>
            <li>
              <strong>out.png</strong> — The rendered output at canonical resolution (1950×2400)
            </li>
            <li>
              <strong>out.snapshot.json</strong> — A sealed execution record containing inputs, resolved{" "}
              <code>protocolVersion</code>, and hashes needed for verification
            </li>
          </ul>

          <h2>Next steps</h2>

          <p>Read the CLI documentation for authentication, canonical constraints, and verification workflows.</p>

          <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>API keys:</strong> Used for authentication and environment separation. Quotas are enforced at the
              account level.
            </p>
            <p className="text-sm text-muted-foreground mb-0">
              <strong>Key limits by plan:</strong> Free includes 2 keys. Pro includes 5. Pro+ includes 10. Enterprise is
              contract-defined.
            </p>
          </div>

          <div className="mt-8">
            <Link
              to="/docs/cli"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
            >
              Read CLI documentation →
            </Link>
          </div>
        </article>
      </PageContent>
    </PageLayout>
  );
};

export default GetStarted;
