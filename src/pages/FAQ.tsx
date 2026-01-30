import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";
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
    question: "Is NexArt only for generative art?",
    answer: (
      <>
        <p className="mb-3">
          No. While NexArt originated in generative art, the underlying system is general-purpose. It can be used for:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Financial simulations and risk models</li>
          <li>Scientific or research visualizations</li>
          <li>Game world generation</li>
          <li>Deterministic AI-assisted pipelines</li>
          <li>Any system where reproducibility and auditability matter</li>
        </ul>
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
      <Helmet>
        <title>FAQ — NexArt Protocol</title>
        <meta
          name="description"
          content="Frequently asked questions about the NexArt Protocol, deterministic execution, certified renders, and the Canonical Renderer."
        />
      </Helmet>

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
