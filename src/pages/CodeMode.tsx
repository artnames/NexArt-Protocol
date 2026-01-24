import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageContent from "@/components/layout/PageContent";
import { Badge } from "@/components/ui/badge";

const CodeMode = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Code Mode | NexArt Protocol</title>
        <meta
          name="description"
          content="Code Mode is a protocol-enforced execution surface under NexArt Protocol v1.2.0. Deterministic, standardized runtime for generative art."
        />
      </Helmet>

      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
          <p className="text-xs font-mono text-caption uppercase tracking-wider mb-4">
            Protocol Documentation
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
            Code Mode
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              HARD Enforced
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
              Protocol v1.2.0
            </span>
          </div>
          <p className="text-body text-lg max-w-2xl">
            Code Mode is a protocol-enforced execution surface under NexArt Protocol v1.2.0. Sketches are executed deterministically within a restricted, standardized runtime.
          </p>
        </div>
      </div>

      <PageContent>
        {/* Guides Section */}
        <p className="text-xs font-mono text-caption uppercase tracking-wider mb-6">
          Guides
        </p>
        
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <Link
            to="/how-code-mode-thinks"
            className="group block border border-border p-6 hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-serif text-foreground group-hover:underline">
                How Code Mode Thinks
              </h2>
              <Badge variant="outline" className="text-xs border-foreground/30 text-caption">
                GUIDE
              </Badge>
            </div>
            <p className="text-body text-sm mb-0">
              The conceptual model for artists.
            </p>
          </Link>
          
          <Link
            to="/common-code-mode-mistakes"
            className="group block border border-border p-6 hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-serif text-foreground group-hover:underline">
                Common Mistakes
              </h2>
              <Badge variant="outline" className="text-xs border-foreground/30 text-caption">
                GUIDE
              </Badge>
            </div>
            <p className="text-body text-sm mb-0">
              Diagnose unexpected behavior.
            </p>
          </Link>
          
          <Link
            to="/code-mode-quick-reference"
            className="group block border border-border p-6 hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-serif text-foreground group-hover:underline">
                Quick Reference
              </h2>
              <Badge variant="outline" className="text-xs border-foreground/30 text-caption">
                PRINT
              </Badge>
            </div>
            <p className="text-body text-sm mb-0">
              One-page printable cheat sheet.
            </p>
          </Link>
        </div>

        <p className="text-xs font-mono text-caption uppercase tracking-wider mb-6">
          Specifications
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Runtime Spec Card */}
          <Link
            to="/code-mode-execution"
            className="group block border border-border p-8 hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-serif text-foreground group-hover:underline">
                Code Mode Runtime Specification
              </h2>
              <Badge variant="default" className="bg-foreground text-background text-xs">
                v1.8.1
              </Badge>
            </div>
            <p className="text-body text-sm mb-4">
              Defines how Code Mode executes under Protocol v1.2.0, including Static and Loop rendering, determinism guarantees, and NFT minting.
            </p>
            <p className="text-caption text-xs">
              Execution surface: frozen
            </p>
            <p className="text-foreground text-sm mt-6 font-mono">
              → Runtime Execution Specification
            </p>
          </Link>

          {/* GSL Draft Card */}
          <Link
            to="/code-mode-v1"
            className="group block border border-border p-8 hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-serif text-foreground group-hover:underline">
                Code Mode v1 — GSL Language Draft
              </h2>
              <Badge variant="outline" className="text-xs border-caption text-caption">
                DRAFT
              </Badge>
            </div>
            <p className="text-body text-sm mb-4">
              Defines the proposed protocol-stable generative language for deterministic, single-frame execution.
            </p>
            <p className="text-caption text-xs">
              Status: Design proposal (not implemented)
            </p>
            <p className="text-foreground text-sm mt-6 font-mono">
              → GSL Language Specification
            </p>
          </Link>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CodeMode;
