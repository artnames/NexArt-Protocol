import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Deterministic Execution Infrastructure for Generative Systems"
        description="NexArt is a protocol and SDK for reproducible execution and verifiable outputs — on-chain or off-chain. Same inputs. Same outputs. Provable. Replayable."
      />

      <PageHeader
        title="Deterministic Execution Infrastructure for Generative Systems"
        subtitle="NexArt is a protocol and SDK for reproducible execution and verifiable outputs — on-chain or off-chain."
      />

      <PageContent>
        <div className="prose-protocol">
          <p className="text-lg text-muted-foreground italic">Same inputs. Same outputs. Provable. Replayable.</p>

          <h2>What Problem Does This Solve?</h2>

          <p>
            Non-deterministic execution breaks reproducibility. Results drift across devices, runtimes, and time. A
            system that produces different results under the same inputs is not auditable, archivable, or trustworthy.
          </p>

          <p>This becomes a problem for:</p>

          <ul>
            <li>
              <strong>Production systems</strong> — that need consistent results across environments
            </li>
            <li>
              <strong>Auditors &amp; compliance teams</strong> — that require replayable, verifiable evidence trails
            </li>
            <li>
              <strong>Long-term archives</strong> — that depend on stable outputs over decades
            </li>
          </ul>

          <p>
            NexArt solves this by enforcing canonical, deterministic execution at the protocol level. The same seed,
            parameters, and code will always produce the same output — regardless of where or when it runs.
          </p>

          <div className="bg-muted/50 border border-border rounded-md p-5 my-8">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Determinism Reference</span>
              <p className="text-sm text-muted-foreground mb-3">
                Public verification harness for NexArt’s deterministic execution and replay guarantees.
              </p>
              <Button asChild variant="outline" className="w-fit">
                <a href="https://determinism.nexart.io" target="_blank" rel="noopener noreferrer">
                  determinism.nexart.io
                </a>
              </Button>
            </div>
          </div>

          <h2>Protocol vs. Applications</h2>

          <p>NexArt separates the protocol layer from the application layer.</p>

          <div className="grid gap-6 md:grid-cols-2 my-6">
            <div className="border border-border rounded-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                  Protocol
                </span>
              </div>
              <p className="text-sm font-medium mb-2">NexArt Protocol &amp; SDK</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-0">
                <li>Canonical execution semantics</li>
                <li>Deterministic, reproducible runs</li>
                <li>
                  Enforced via <code className="text-xs bg-muted px-1 py-0.5 rounded">@nexart/codemode-sdk v1.8.4</code>{" "}
                  (deterministic runtime)
                </li>
                <li>Protocol v1.2.0 — Locked &amp; Stable</li>
              </ul>
            </div>

            <div className="border border-border rounded-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Applications
                </span>
              </div>
              <p className="text-sm font-medium mb-2">Apps Built on NexArt</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-0">
                <li>NexArt (reference application)</li>
                <li>ByX (generative collections)</li>
                <li>Third-party implementations</li>
                <li>Custom builder integrations</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground italic">
            Applications are replaceable. The execution layer is the product.
          </p>

          <h2>For Builders</h2>

          <p>
            The NexArt SDK provides a deterministic runtime for generative workloads (rendering, simulations, agent
            steps). Free for experimentation. Designed for production use.
          </p>

          <div className="flex flex-wrap gap-3 my-6">
            <Button asChild variant="outline">
              <Link to="/builders">SDK Documentation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/protocol">Protocol Reference</Link>
            </Button>
          </div>

          <h2>Protocol Status</h2>

          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 my-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol v1.2.0
              </span>
              <span className="text-sm font-medium">Locked &amp; Stable</span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Shapes, Noise, SoundArt, and Code Mode are fully protocol-enforced. All outputs are deterministic,
              reproducible, and verifiable — rendered exclusively via the NexArt Code Mode runtime.
            </p>
          </div>

          <h2>Reference</h2>

          <ul>
            <li>
              <Link to="/protocol" className="text-link hover:text-link-hover underline underline-offset-2">
                Protocol Overview
              </Link>{" "}
              — The conceptual foundation
            </li>
            <li>
              <Link to="/canonical-unit" className="text-link hover:text-link-hover underline underline-offset-2">
                Canonical Unit
              </Link>{" "}
              — The core protocol object
            </li>
            <li>
              <Link to="/determinism" className="text-link hover:text-link-hover underline underline-offset-2">
                Determinism &amp; Versioning
              </Link>{" "}
              — Guarantees and constraints
            </li>
            <li>
              <Link to="/modes" className="text-link hover:text-link-hover underline underline-offset-2">
                Modes
              </Link>{" "}
              — The creation primitives
            </li>
          </ul>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Index;
