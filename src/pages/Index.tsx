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
        <title>NexArt Protocol - A Generative Art Protocol</title>
        <meta name="description" content="NexArt is a generative art protocol. Build, preview, and mint deterministic generative systems with open SDKs for creators, builders, and AI tools." />
      </Helmet>
      
      <PageHeader 
        title="NexArt is a Generative Art Protocol"
        subtitle="Build, preview, and mint deterministic generative systems — on NexArt or anywhere else."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p className="text-lg text-muted-foreground">
            NexArt defines a canonical execution layer for generative art, with open SDKs for creators, builders, and AI tools.
          </p>

          <h2>The NexArt Stack</h2>
          
          <div className="grid gap-6 md:grid-cols-2 my-6">
            <div className="border border-border rounded-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                  Canonical
                </span>
                <span className="text-sm font-medium">Code Mode Protocol</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 mb-3">
                <li>Deterministic, archival-safe execution</li>
                <li>Used for minting NFTs and permanent outputs</li>
                <li>Locked Protocol v1.0.0</li>
                <li>Implemented via <code className="text-xs bg-muted px-1 py-0.5 rounded">@nexart/codemode-sdk</code></li>
              </ul>
            </div>
            
            <div className="border border-border rounded-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Non-canonical
                </span>
                <span className="text-sm font-medium">UI Renderer</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 mb-3">
                <li>Live previews and exploration</li>
                <li>Declarative primitives and AI-friendly APIs</li>
                <li>Compiles to Code Mode, but never replaces it</li>
                <li>Implemented via <code className="text-xs bg-muted px-1 py-0.5 rounded">@nexart/ui-renderer</code></li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground italic">
            Same protocol. Different tools. No lock-in.
          </p>

          <h2>Build on NexArt</h2>
          
          <ul>
            <li>Build your own generative art apps using NexArt SDKs</li>
            <li>Use the same protocol as{" "}
              <a 
                href="https://nexart.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-link hover:text-link-hover underline underline-offset-2"
              >
                nexart.xyz
              </a>
            </li>
            <li>No requirement to use NexArt UI</li>
            <li>Supports static, animated, and parameterized systems</li>
            <li>Designed for AI-assisted creation</li>
          </ul>
          
          <div className="flex flex-wrap gap-3 my-6">
            <Button asChild variant="outline">
              <Link to="/builders">View SDKs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/protocol">Read Protocol Docs</Link>
            </Button>
          </div>

          <h2>ByX — Generative Collections</h2>
          
          <p>
            ByX lets artists publish generative systems instead of single artworks. Collectors mint their own outputs inside artist-defined rules.
          </p>
          
          <div className="my-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              Coming soon
            </span>
          </div>

          <h2>Protocol Status</h2>
          
          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 my-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol v1.0.0
              </span>
              <span className="text-sm font-medium">Locked & Stable</span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Shapes, Noise, SoundArt, and Code Mode are fully protocol-enforced. All outputs are deterministic, reproducible, and verifiable — rendered exclusively via the NexArt Code Mode runtime.
            </p>
          </div>

          <h2>Where to Begin</h2>
          
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
              <Link to="/modes" className="text-link hover:text-link-hover underline underline-offset-2">
                Modes
              </Link>
              {" "}— The creation primitives
            </li>
            <li>
              <Link to="/builders" className="text-link hover:text-link-hover underline underline-offset-2">
                Builders
              </Link>
              {" "}— For those who want to contribute
            </li>
          </ul>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Index;
