import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>NexArt Protocol — Deterministic Generative Media Infrastructure</title>
        <meta name="description" content="NexArt is a protocol and SDK for reproducible, verifiable generative output — on-chain or off-chain. Same input. Same output. Everywhere." />
      </Helmet>
      
      <PageHeader 
        title="Deterministic Generative Media Infrastructure"
        subtitle="NexArt is a protocol and SDK for reproducible, verifiable generative output — on-chain or off-chain."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p className="text-lg text-muted-foreground italic">
            Same input. Same output. Everywhere.
          </p>

          <h2>What Problem Does This Solve?</h2>
          
          <p>
            Non-deterministic generation breaks reproducibility. Outputs drift across devices, runtimes, and time. A generative system that produces different results on different machines is not verifiable, archivable, or trustworthy.
          </p>
          
          <p>
            This becomes a problem for:
          </p>
          
          <ul>
            <li><strong>Applications</strong> — that need consistent rendering across environments</li>
            <li><strong>Archives</strong> — that require outputs to remain stable over decades</li>
            <li><strong>Institutions</strong> — that depend on verifiable, reproducible media</li>
          </ul>
          
          <p>
            NexArt solves this by enforcing deterministic execution at the protocol level. The same seed, parameters, and code will always produce the same output — regardless of where or when it is rendered.
          </p>

          <div className="bg-muted/50 border border-border rounded-md p-5 my-8">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Determinism Reference</span>
              <p className="text-sm text-muted-foreground mb-3">
                Public, executable proof of NexArt's deterministic execution guarantees.
              </p>
              <Button asChild variant="outline" className="w-fit">
                <a 
                  href="https://determinism.nexart.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  determinism.nexart.io
                </a>
              </Button>
            </div>
          </div>

          <h2>Protocol vs. Applications</h2>
          
          <p>
            NexArt separates the protocol layer from the application layer.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 my-6">
            <div className="border border-border rounded-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                  Protocol
                </span>
              </div>
              <p className="text-sm font-medium mb-2">NexArt Protocol & SDK</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-0">
                <li>Canonical execution semantics</li>
                <li>Deterministic, reproducible output</li>
                <li>Enforced via <code className="text-xs bg-muted px-1 py-0.5 rounded">@nexart/codemode-sdk v1.8.1</code></li>
                <li>Protocol v1.2.0 — Locked & Stable</li>
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
            Applications are replaceable. The protocol is the product.
          </p>

          <h2>For Builders</h2>
          
          <p>
            The NexArt SDK provides a deterministic runtime for generative systems. Free for experimentation. Designed for production use.
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
              <span className="text-sm font-medium">Locked & Stable</span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Shapes, Noise, SoundArt, and Code Mode are fully protocol-enforced. All outputs are deterministic, reproducible, and verifiable — rendered exclusively via the NexArt Code Mode runtime.
            </p>
          </div>

          <h2>Reference</h2>
          
          <ul>
            <li>
              <Link to="/protocol" className="text-link hover:text-link-hover underline underline-offset-2">
                Protocol Overview
              </Link>
              {" "}— The conceptual foundation
            </li>
            <li>
              <Link to="/canonical-unit" className="text-link hover:text-link-hover underline underline-offset-2">
                Canonical Unit
              </Link>
              {" "}— The core protocol object
            </li>
            <li>
              <Link to="/determinism" className="text-link hover:text-link-hover underline underline-offset-2">
                Determinism & Versioning
              </Link>
              {" "}— Guarantees and constraints
            </li>
            <li>
              <Link to="/modes" className="text-link hover:text-link-hover underline underline-offset-2">
                Modes
              </Link>
              {" "}— The creation primitives
            </li>
          </ul>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Index;
