import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BuilderRewards = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Builder Rewards (Draft v0) | NexArt Protocol</title>
        <meta
          name="description"
          content="Protocol-aligned recognition for real NexArt builders. Draft specification for future builder rewards."
        />
      </Helmet>

      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <header className="mb-16">
          <p className="text-xs font-mono text-caption tracking-wide mb-3">
            DRAFT v0
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-4 tracking-tight">
            Builder Rewards
          </h1>
          <p className="text-lg text-body leading-relaxed">
            Protocol-aligned recognition for real NexArt builders.
          </p>
        </header>

        {/* What Builder Rewards Are */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            What Builder Rewards Are
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>
              Builder rewards are a future mechanism for recognizing applications 
              that correctly implement the NexArt protocol and SDK.
            </p>
            <p>
              They are designed to support long-term ecosystem health by encouraging 
              correct, deterministic, protocol-aligned usage — not short-term incentives.
            </p>
            <div className="border-l-2 border-border pl-4 my-6">
              <p className="text-sm text-caption">Important constraints:</p>
              <ul className="mt-2 space-y-1 text-sm text-body">
                <li>• Rewards are observational, not automatic</li>
                <li>• Rewards are not guaranteed</li>
                <li>• Rewards are not live</li>
                <li>• This page defines rules only</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What Builder Rewards Are NOT */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            What Builder Rewards Are NOT
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <ul className="space-y-2">
              <li>• Not an airdrop</li>
              <li>• Not usage farming</li>
              <li>• Not paid per render</li>
              <li>• Not a growth incentive</li>
              <li>• Not a replacement for grants</li>
            </ul>
            <p className="mt-6 text-foreground font-medium">
              Incorrect, forked, modified, or non-deterministic implementations are not eligible.
            </p>
          </div>
        </section>

        {/* Eligibility */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Eligibility
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>An application may be considered eligible if it:</p>
            <ul className="space-y-2 ml-4">
              <li>• Uses the official NexArt SDK without modification</li>
              <li>• Executes Code Mode deterministically</li>
              <li>• Respects the NexArt protocol (execution model, VAR semantics, forbidden patterns)</li>
              <li>• Serves real users</li>
              <li>• Publishes a valid builder manifest (see below)</li>
            </ul>
            <p className="mt-6 text-caption text-sm">
              Eligibility does not imply approval or reward.
            </p>
          </div>
        </section>

        {/* Builder Manifest */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Builder Manifest (Draft)
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>
              Builders will be required to publish a small, public manifest file 
              that identifies their application and SDK usage.
            </p>
            <ul className="space-y-2 ml-4 mt-4">
              <li>• Similar to <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/.well-known/</code> patterns</li>
              <li>• One manifest per app</li>
              <li>• Used for attribution, not tracking</li>
              <li>• No private keys</li>
              <li>• No user data</li>
            </ul>
            <p className="mt-6 text-caption text-sm">
              The manifest specification will be published separately.
            </p>
          </div>
        </section>

        {/* Anti-Abuse Principles */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Anti-Abuse Principles
          </h2>
          <div className="space-y-2 text-body leading-relaxed">
            <ul className="space-y-2">
              <li>• One app ≠ unlimited rewards</li>
              <li>• Sybil resistance enforced</li>
              <li>• Real usage matters</li>
              <li>• Manual review may apply</li>
              <li>• NexArt reserves the right to exclude abusive implementations</li>
            </ul>
          </div>
        </section>

        {/* Status & Roadmap */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Status
          </h2>
          <div className="bg-muted/50 border border-border rounded-md p-6">
            <p className="text-foreground font-mono text-sm mb-4">
              Status: Not Live
            </p>
            <ul className="space-y-2 text-body text-sm">
              <li>• Builder rewards are not active.</li>
              <li>• No SDK version currently emits rewards.</li>
              <li>• No claims can be made at this stage.</li>
            </ul>
            <p className="mt-4 text-body text-sm">
              SDK v1.8.2 continues identity declaration only. Incentives are not active.
            </p>
            <p className="mt-2 text-caption text-sm">
              This page exists to define rules before implementation.
            </p>
          </div>
        </section>

        {/* Governance & Authority */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Governance & Authority
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>
              NexArt protocol rules are defined publicly. SDK behavior must follow 
              these rules. Rewards, if introduced, will follow published protocol policy.
            </p>
          </div>
        </section>

        {/* Feedback Note */}
        <section className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-caption">
            Feedback from builders is welcome before any implementation.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BuilderRewards;
