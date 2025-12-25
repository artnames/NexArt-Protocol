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
          content="NexArt Code Mode documentation. Two layers: current runtime behavior (v0.x) and future protocol language proposal (v1 GSL)."
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
          <p className="text-body text-lg max-w-2xl">
            Two layers: current runtime behavior vs future protocol language.
          </p>
        </div>
      </div>

      <PageContent>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Runtime Spec Card */}
          <Link
            to="/code-mode-execution"
            className="group block border border-border p-8 hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-serif text-foreground group-hover:underline">
                Code Mode Runtime (v0.x)
              </h2>
              <Badge variant="default" className="bg-foreground text-background text-xs">
                CURRENT
              </Badge>
            </div>
            <p className="text-body text-sm mb-4">
              Defines how Code Mode executes today, including Static and Loop rendering and NFT minting.
            </p>
            <p className="text-caption text-xs">
              Implemented in: nexart.xyz
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
