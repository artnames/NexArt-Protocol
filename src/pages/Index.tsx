import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";

const useCases = [
  { title: "AI Agents", desc: "Enforce deterministic decision trails across autonomous, self-directed agent workflows." },
  { title: "Financial Simulation", desc: "Guarantee reproducible outcomes for auditable quantitative models." },
  { title: "Automation Systems", desc: "Eliminate execution drift in compliance-sensitive pipelines." },
  { title: "Governance Mechanisms", desc: "Provide cryptographic proof of policy execution and rule enforcement." },
  { title: "Generative Systems", desc: "Ensure canonical, verifiable outputs across rendering environments." },
];

const Index = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Verifiable Execution Infrastructure for AI & Generative Systems"
        description="NexArt enforces canonical execution semantics — generating deterministic replay and cryptographic proof of execution across environments and time."
      />

      <PageHeader
        title="Verifiable Execution Infrastructure for AI & Generative Systems"
        subtitle="Replayable. Auditable. Cryptographically Verifiable."
      />

      <PageContent>
        <div className="prose-protocol">
          {/* Hero body */}
          <p className="text-lg text-muted-foreground">
            As AI systems become autonomous, execution must be reproducible and independently verifiable.
          </p>
          <p>
            If identical inputs can produce different outputs, your system cannot be reliably audited, defended, or archived.
          </p>
          <p>
            NexArt enforces canonical execution semantics at the protocol level — generating deterministic
            replay and cryptographic proof of execution across environments and time.
          </p>
          <p>
            This transforms execution from a runtime behavior into verifiable infrastructure.
          </p>

          <div className="flex flex-wrap gap-3 my-8">
            <Button asChild>
              <Link to="/contact">Run a Deterministic Integration Test</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/protocol">Read the Protocol</Link>
            </Button>
          </div>

          {/* Section 2: Operational Risk */}
          <h2>Where Non-Determinism Becomes Operational Risk</h2>

          <p>Non-deterministic systems may appear stable — until reproducibility is required.</p>

          <p>Execution drift creates silent risk in:</p>

          <ul>
            <li>AI agent decision workflows</li>
            <li>Compliance-sensitive automation pipelines</li>
            <li>Financial simulations requiring deterministic replay</li>
            <li>Model evaluation and benchmarking systems</li>
            <li>Long-term digital archives</li>
          </ul>

          <p className="text-sm text-muted-foreground italic">
            If reproducibility matters in your domain, determinism is infrastructure — not a feature.
          </p>

          {/* Section 3: Guarantees */}
          <h2>Protocol-Level Execution Guarantees</h2>

          <ul>
            <li>Canonical execution semantics</li>
            <li>Version-pinned runtime guarantees</li>
            <li>Deterministic replay across environments</li>
            <li>Cryptographic output fingerprinting</li>
            <li>Independent verification via canonical node attestation</li>
          </ul>

          <p className="text-sm text-muted-foreground italic">
            This is not observability. It is enforced execution integrity at the protocol layer.
          </p>

          {/* Section 4: How It Works */}
          <h2>How Verifiable Execution Works</h2>

          <div className="grid gap-6 md:grid-cols-3 my-6">
            <div className="border border-border rounded-md p-5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground mb-3">
                1
              </span>
              <p className="text-sm font-medium mb-2">Snapshot</p>
              <p className="text-sm text-muted-foreground mb-0">
                Inputs, parameters, runtime version, and environment are normalized and hashed.
              </p>
            </div>
            <div className="border border-border rounded-md p-5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground mb-3">
                2
              </span>
              <p className="text-sm font-medium mb-2">Canonical Verification</p>
              <p className="text-sm text-muted-foreground mb-0">
                The bundle is independently verified by the NexArt canonical node.
              </p>
            </div>
            <div className="border border-border rounded-md p-5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground mb-3">
                3
              </span>
              <p className="text-sm font-medium mb-2">Proof of Execution</p>
              <p className="text-sm text-muted-foreground mb-0">
                A Certified Execution Record (CER) is generated and can be independently validated without trusting the originating application.
              </p>
            </div>
          </div>

          {/* Section 5: Protocol vs Applications */}
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
                  Enforced via <code className="text-xs bg-muted px-1 py-0.5 rounded">@nexart/codemode-sdk v1.8.4</code>
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
            Applications evolve. The execution layer remains canonical.
          </p>

          {/* Section 6: Applicable Domains */}
          <h2>Applicable Domains</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 my-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="border border-border rounded-md p-5">
                <p className="text-sm font-medium mb-1">{uc.title}</p>
                <p className="text-sm text-muted-foreground mb-0">{uc.desc}</p>
              </div>
            ))}
          </div>

          {/* Section 7: Reference Implementation */}
          <h2>Reference Implementation</h2>

          <p>
            Generative art was the first domain where NexArt enforced strict deterministic replay across
            environments — proving canonical execution guarantees in practice.
          </p>
          <p>
            It served as a high-variance stress test for protocol-level reproducibility.
          </p>

          <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Determinism Reference</span>
              <p className="text-sm text-muted-foreground mb-3">
                Public verification harness for NexArt's deterministic execution and replay guarantees.
              </p>
              <Button asChild variant="outline" className="w-fit">
                <a href="https://determinism.nexart.io" target="_blank" rel="noopener noreferrer">
                  determinism.nexart.io
                </a>
              </Button>
            </div>
          </div>

          {/* For Builders */}
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

          {/* Protocol Status */}
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
              reproducible, and verifiable, rendered exclusively via the NexArt Code Mode runtime.
            </p>
          </div>

          {/* Reference links */}
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

          {/* Enterprise Wedge: Deterministic Integration Test */}
          <div className="bg-muted/50 border border-border rounded-md p-6 my-12">
            <h2 className="mt-0">Run a Deterministic Integration Test</h2>
            <p>
              We evaluate one of your AI or generative workflows using the NexArt deterministic runtime and canonical verification layer.
            </p>
            <p>You receive:</p>
            <ul>
              <li>Drift detection results</li>
              <li>Replay validation</li>
              <li>Snapshot hash</li>
              <li>Certified Execution Record (CER)</li>
            </ul>
            <p className="text-sm text-muted-foreground italic mb-4">
              Identify reproducibility risk before it becomes regulatory, financial, or reputational liability.
            </p>
            <Button asChild>
              <Link to="/contact">Request Integration Test</Link>
            </Button>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Index;
