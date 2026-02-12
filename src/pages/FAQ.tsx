import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is NexArt?",
    answer:
      "NexArt is a protocol and canonical execution system for deterministic generative computation. It allows code, inputs, and runtime to be executed in a standardized environment so results are reproducible, verifiable, and replayable at any point in the future.",
  },
  {
    question: "What problem does NexArt solve?",
    answer:
      "Most generative systems, including simulations, models, and creative tools, cannot prove that the same inputs will always produce the same outputs. NexArt solves this by enforcing deterministic execution and producing cryptographic proofs that bind code, inputs, runtime, and output together.",
  },
  {
    question: "What can I use NexArt for?",
    answer: (
      <>
        <p className="mb-3">
          NexArt is a general-purpose deterministic execution and verification system. It is designed for any workflow
          where results must be reproducible, portable, and independently verifiable.
        </p>
        <ul className="space-y-2 text-muted-foreground mb-3">
          <li>
            <strong className="text-foreground">Generative systems</strong> — Seal code + seed + VAR → canonical PNG + output hash
          </li>
          <li>
            <strong className="text-foreground">Financial simulations</strong> — Certify a stress test / risk calc so an auditor can replay the exact run
          </li>
          <li>
            <strong className="text-foreground">Scientific & research workflows</strong> — Reproducible visualizations and simulations for peer review
          </li>
          <li>
            <strong className="text-foreground">Game world generation</strong> — Regenerate worlds from a seed instead of storing full world state
          </li>
          <li>
            <strong className="text-foreground">Deterministic AI-assisted pipelines</strong> — Pin AI outputs into deterministic execution to prevent drift
          </li>
          <li>
            <strong className="text-foreground">AI execution with audit-grade integrity</strong> — Capture, seal, and audit AI/LLM runs (see{" "}
            <Link to="/protocol/ai-execution-integrity" className="text-link hover:text-link-hover underline underline-offset-2">
              AI Execution Integrity
            </Link>{" "}surface)
          </li>
          <li>
            <strong className="text-foreground">Any workflow where results may be challenged later</strong> — If someone might ask "prove it", NexArt is the tool
          </li>
        </ul>
        <p>
          If it matters enough that someone might question it later, NexArt is designed so you can re-run it.
        </p>
      </>
    ),
  },
  {
    question: "What is the Canonical Renderer?",
    answer: (
      <>
        <p className="mb-3">The Canonical Renderer is the reference execution environment for NexArt. It enforces:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>A fixed runtime</li>
          <li>Locked canvas dimensions</li>
          <li>Deterministic randomness</li>
          <li>Protocol versioning</li>
        </ul>
        <p>
          Only outputs produced by the Canonical Renderer can be independently verified and used for archival, minting,
          or audit-grade certification.
        </p>
      </>
    ),
  },
  {
    question: "Why is determinism important?",
    answer: (
      <>
        <p className="mb-3">Determinism ensures that:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>The same code + inputs always produce the same output</li>
          <li>Results can be replayed and verified independently</li>
          <li>There is no hidden drift, timing dependency, or environment leakage</li>
        </ul>
        <p>This is critical for trust, long-term archival, and audits.</p>
      </>
    ),
  },
  {
    question: 'What does "certified execution" mean?',
    answer: (
      <>
        <p className="mb-3">A certified execution is a run performed by the Canonical Renderer that produces:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>A binary output (e.g. PNG)</li>
          <li>A cryptographic output hash</li>
          <li>A snapshot containing inputs, parameters, and protocol metadata</li>
        </ul>
        <p>Anyone can later re-execute the snapshot and verify the result matches exactly.</p>
      </>
    ),
  },
  {
    question: "Is NexArt onchain?",
    answer:
      "Execution happens off-chain for performance and cost reasons. However, outputs or execution proofs can optionally be anchored onchain (e.g. on Base) by storing a hash or Merkle root. This provides tamper-proof timestamping without high gas costs.",
  },
  {
    question: "What guarantees does NexArt provide?",
    answer: (
      <>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Deterministic execution (same inputs → same output hash)</li>
          <li>Canonical runtime fingerprinting (runtime hash headers)</li>
          <li>Snapshot-based replay and independent verification</li>
          <li>Optional onchain anchoring (hash / Merkle root) for tamper-evidence</li>
          <li>Account-level quota enforcement with clear 429 when exceeded</li>
        </ul>
      </>
    ),
  },
  {
    question: "How does NexArt handle protocol versions?",
    answer: (
      <>
        <p className="mb-3">Requests may omit protocolVersion. When omitted:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>The Canonical Renderer defaults to its current protocol version</li>
          <li>The resolved version is returned in headers</li>
          <li>The snapshot records the resolved version</li>
        </ul>
        <p>This ensures forward compatibility while preserving audit integrity.</p>
      </>
    ),
  },
  {
    question: "What happens if the protocol changes?",
    answer:
      "Protocol versions are immutable once released. Snapshots always record the resolved protocol version, so past executions remain replayable even as the system evolves.",
  },
  {
    question: "How is usage limited?",
    answer: (
      <>
        <p className="mb-3">Usage is enforced at the account level, not per API key.</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>All API keys under an account share the same monthly quota</li>
          <li>Key limits depend on the plan (Free, Pro, Pro+, Enterprise)</li>
          <li>Quota applies only to successful certified renders</li>
        </ul>
        <p>Quota status is returned via response headers on every request.</p>
      </>
    ),
  },
  {
    question: "How much does NexArt cost in practice?",
    answer: (
      <>
        <p className="mb-3">
          Pricing is based on certified executions (successful canonical renders). Quota is account-level and shared across API keys.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>A single certified render is typically ~100–300ms</li>
          <li>Certifying a procedural world seed or simulation step is usually fractions of a cent at Pro-level pricing</li>
          <li>Verification and replay cost the same as a render (they re-execute the snapshot)</li>
        </ul>
        <p>
          See{" "}
          <Link to="/pricing" className="text-link hover:text-link-hover underline underline-offset-2">
            Pricing
          </Link>
          {" "}for the exact plan limits and key limits.
        </p>
      </>
    ),
  },
  {
    question: "What happens when I exceed my quota?",
    answer: (
      <>
        <p className="mb-3">When the monthly quota is exceeded:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>The renderer returns HTTP 429</li>
          <li>No execution is performed</li>
          <li>Headers indicate quota limit, used, and remaining</li>
        </ul>
        <p>This guarantees no "hidden" executions beyond plan limits.</p>
      </>
    ),
  },
  {
    question: "Is NexArt secure?",
    answer: (
      <>
        <p className="mb-3">Yes. Key security properties include:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>API keys are hashed at rest</li>
          <li>Canonical execution is sandboxed and isolated</li>
          <li>No user-supplied code can escape the runtime</li>
          <li>Deterministic execution prevents timing or entropy attacks</li>
          <li>Full audit trail via usage logs and snapshots</li>
        </ul>
        <p>
          A detailed{" "}
          <Link to="/security" className="text-link hover:text-link-hover underline underline-offset-2">
            Security Architecture
          </Link>
          {" "}page is available.
        </p>
      </>
    ),
  },
  {
    question: "Can someone fork the node and fake certification?",
    answer: (
      <>
        <p className="mb-3">
          They can fork the code, but they cannot fake canonical trust. Certification value comes from:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
          <li>The recognized Canonical Renderer</li>
          <li>Stable protocol guarantees</li>
          <li>Verifiable hashes that match known runtime fingerprints</li>
        </ul>
        <p>Clients, auditors, and collectors verify against the canonical reference, not arbitrary forks.</p>
      </>
    ),
  },
  {
    question: "Why is NexArt useful for game world generation?",
    answer: (
      <>
        <p className="mb-3">
          You regenerate from a seed at a fraction of the cost of storing or syncing full world state.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Seed-based regeneration can drastically reduce storage and sync costs</li>
          <li>Worlds can be proven unchanged over time (hash verification)</li>
          <li>Builders can certify world generation for tournaments, fairness, or anti-tamper</li>
        </ul>
      </>
    ),
  },
  {
    question: "Who should use NexArt?",
    answer: (
      <>
        <p className="mb-3">NexArt is suited for:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Artists and creators who care about permanence</li>
          <li>Builders creating deterministic systems</li>
          <li>Fintech and DeFi teams needing replayable simulations</li>
          <li>Researchers who need reproducible visual outputs</li>
          <li>Platforms that want audit-grade generative pipelines</li>
        </ul>
      </>
    ),
  },
  {
    question: "Where can I see real demos?",
    answer: (
      <>
        <p className="mb-3">
          NexArt has live, production-grade demos across multiple domains demonstrating deterministic execution, certification, and replay:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3">
          <li>
            <a href="https://velocity.recanon.xyz/" target="_blank" rel="noreferrer" className="text-link hover:text-link-hover underline underline-offset-2">Certified Velocity Decision</a>
            {" "}— Deterministic risk execution and replay (fintech / controls)
          </li>
          <li>
            <a href="https://byxcollection.xyz" target="_blank" rel="noreferrer" className="text-link hover:text-link-hover underline underline-offset-2">ByX Collection</a>
            {" "}— Creative coding and generative systems built on NexArt
          </li>
          <li>
            <a href="https://frontierra.xyz" target="_blank" rel="noreferrer" className="text-link hover:text-link-hover underline underline-offset-2">Frontierra</a>
            {" "}— Deterministic open-world generation for games
          </li>
          <li>
            <a href="https://nexartsciencelab.xyz" target="_blank" rel="noreferrer" className="text-link hover:text-link-hover underline underline-offset-2">NexArt Science Lab</a>
            {" "}— Reproducible scientific and research models
          </li>
        </ul>
        <p>
          The NexArt CLI already supports certified execution, verification, and replay. Get started via the{" "}
          <Link to="/builders/quickstart" className="text-link hover:text-link-hover underline underline-offset-2">
            Quickstart guide
          </Link>.
        </p>
      </>
    ),
  },
  {
    question: "How do I get started?",
    answer: (
      <>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>
            Read the{" "}
            <Link to="/builders" className="text-link hover:text-link-hover underline underline-offset-2">
              Builders documentation
            </Link>
          </li>
          <li>Create an API key</li>
          <li>Run your first certified render using the CLI</li>
          <li>Verify or replay the snapshot independently</li>
        </ol>
      </>
    ),
  },
];

const FAQ = () => {
  return (
    <PageLayout>
      <SEOHead 
        title="FAQ"
        description="Frequently asked questions about the NexArt Protocol, deterministic execution, certified renders, and the Canonical Renderer."
      />

      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Common questions about NexArt, deterministic execution, and certified rendering."
      />

      <PageContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </PageContent>
    </PageLayout>
  );
};

export default FAQ;
