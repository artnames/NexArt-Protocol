import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const NonGoals = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Non-Goals – NexArt Protocol</title>
        <meta name="description" content="What the NexArt protocol explicitly does not aim to do. Clear boundaries for builders, contributors, and observers." />
      </Helmet>
      
      <PageHeader 
        title="Non-Goals" 
        subtitle="Clear boundaries are what make long-lived protocols possible. This page states what the NexArt protocol is not trying to do."
      />
      
      <PageContent>
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a Prompt Generator</h2>
          <p className="text-body mb-4">
            NexArt systems are authored, not prompted. The protocol does not include natural language interfaces, text-to-image generation, or AI-driven creation as core primitives.
          </p>
          <p className="text-body">
            Systems are crafted through deliberate parameter selection, code authorship, or structured input composition. The creative act is explicit, not delegated to a model. Implementations may choose to offer assistive tools, but these are outside the protocol's scope.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a Style Marketplace</h2>
          <p className="text-body mb-4">
            NexArt does not aim to catalogue, trade, or license visual styles. The protocol defines systems, not aesthetic taxonomies.
          </p>
          <p className="text-body">
            Systems may produce outputs that share visual characteristics, but the protocol does not model "style" as a first-class concept. Commerce, licensing, or style transfer mechanisms are outside the protocol's concern.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a Single Rendering Engine</h2>
          <p className="text-body mb-4">
            The protocol does not mandate or provide a single renderer. Multiple renderers are expected and encouraged.
          </p>
          <p className="text-body">
            Different implementations may render the same system using different technologies, optimizations, or output formats. The protocol specifies what a system means, not how it must be drawn. Renderer diversity strengthens the ecosystem by preventing dependency on any single codebase.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a Platform Lock-In Mechanism</h2>
          <p className="text-body mb-4">
            The protocol is designed to outlive any single application, including the current NexArt app at nexart.xyz.
          </p>
          <p className="text-body">
            Systems authored today should remain interpretable and renderable by future tools, regardless of which applications exist. The canonical unit format, specification, and reference implementations will be publicly available to ensure that no single vendor controls access to authored work.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a DAO or Governance Token System</h2>
          <p className="text-body mb-4">
            Protocol governance is not driven by token voting, staking, or decentralized autonomous organization mechanics.
          </p>
          <p className="text-body">
            Governance will mature over time through structured stewardship, not financialized decision-making. Contributors and builders influence the protocol through participation, proposals, and demonstrated commitment—not through token holdings.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a Blockchain Requirement</h2>
          <p className="text-body mb-4">
            NexArt systems are protocol objects regardless of whether they are stored on-chain. The protocol does not require blockchain usage for validity, ownership, or authenticity.
          </p>
          <p className="text-body">
            Systems may be stored on-chain, off-chain, or in hybrid arrangements. The protocol is agnostic to storage medium. On-chain representation is one possible use case, not a protocol requirement.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not Guaranteed Pixel-Perfect Replay in All Contexts</h2>
          <p className="text-body mb-4">
            The protocol values honesty about reproducibility. Pixel-perfect determinism is achievable for conforming implementations under specified rendering rules, but it is not universally guaranteed.
          </p>
          <p className="text-body">
            Floating-point behavior, hardware differences, audio analysis variations, and unpinned dependencies may cause outputs to differ. The protocol distinguishes between deterministic and best-effort systems precisely because absolute guarantees are not always possible.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a Finished Specification</h2>
          <p className="text-body mb-4">
            The protocol is a specification-in-progress. Definitions, mode semantics, and rendering rules are evolving.
          </p>
          <p className="text-body">
            Early adopters should expect changes. The protocol will stabilize through real-world implementation, feedback, and deliberate iteration. Stability is a goal, not a starting condition.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Not a Standalone Service</h2>
          <p className="text-body">
            The NexArt Protocol is not currently intended to operate as a standalone service or replace the NexArt application.
          </p>
        </section>

        <section className="pt-8 border-t border-border">
          <p className="text-body">
            Protocols that try to do everything eventually do nothing well. These non-goals exist to protect the protocol's coherence and to set honest expectations for everyone who builds with or against NexArt. Clear boundaries are what make long-lived protocols possible.
          </p>
        </section>
      </PageContent>
    </PageLayout>
  );
};

export default NonGoals;
