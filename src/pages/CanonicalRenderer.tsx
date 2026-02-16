import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const CanonicalRenderer = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Canonical Renderer | Certification Grade Execution"
        description="The NexArt Canonical Renderer is a reference implementation for certification-grade deterministic execution. It produces verified outputs and cryptographic hashes for replay and audit workflows."
      />

      <PageHeader
        title="NexArt Canonical Renderer"
        subtitle="A reference implementation for certification-grade deterministic execution."
      />

      <PageContent>
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">What the Canonical Renderer Is</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              The Canonical Renderer is the reference implementation used for certified runs under the NexArt protocol.
              It executes a canonical unit in a controlled environment and produces an output artifact plus a
              cryptographic hash that can be used for verification.
            </p>
            <p className="text-body mb-4">
              Execution is deterministic. Given the same canonical unit, protocol version, and seed, the renderer
              produces identical output on every run. The output is stable at the byte level, which makes certification
              and replay verification possible.
            </p>
            <p className="text-body">
              Each render operation returns the output bytes and the output hash. The hash acts as a verifiable
              fingerprint, allowing any party to confirm that an artifact corresponds to a specific canonical unit. This
              supports on-chain minting, audit verification, and research reproducibility.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">Why NexArt Provides a Reference Renderer</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              NexArt operates a public reference renderer to reduce integration work for builders. A working
              implementation establishes a shared standard, makes early testing simple, and provides a concrete target
              for compliant implementations.
            </p>
            <p className="text-body mb-4">
              The reference renderer is a convenience, not a protocol dependency. Builders can prototype and ship
              without provisioning infrastructure, and teams with strict requirements can run their own renderer without
              changing protocol behavior.
            </p>
            <p className="text-body">
              The protocol remains open. Compliance is defined by output equivalence under the pinned protocol
              semantics, not by any single node.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">Using the Reference Renderer</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              The reference renderer is suitable for testing, previews, and small-scale production workloads. No setup
              is required. Builders submit canonical units and receive verified outputs immediately.
            </p>
            <p className="text-body mb-4">
              The public node is operated on a best-effort basis. Availability and throughput can vary. Teams with
              production requirements that demand specific performance or isolation should deploy their own renderer.
            </p>
            <p className="text-body">
              Output produced by the reference node is identical to output produced by any compliant renderer given the
              same inputs and protocol version.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">Running Your Own Renderer</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              Self-hosting is optional, and the protocol is designed to support it. Builders who want control over
              availability, scaling, performance, or data locality can deploy a compliant renderer and still produce
              outputs that match the reference implementation.
            </p>
            <p className="text-body mb-4">Running your own renderer provides:</p>
            <ul className="list-disc pl-6 text-body mb-4 space-y-2">
              <li>Control over availability and scaling</li>
              <li>Performance characteristics tailored to your workloads</li>
              <li>Isolation from shared resources</li>
              <li>Operational independence from NexArt infrastructure</li>
            </ul>
            <p className="text-body">
              The choice between using the public renderer and running your own is purely operational. The protocol does
              not distinguish between them.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">Protocol Philosophy</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              NexArt is not tied to a single rendering service. The protocol defines the input format, the versioned
              execution semantics, and the output specification. Any renderer that implements those semantics is
              compliant.
            </p>
            <p className="text-body mb-4">
              Trust comes from determinism and verification. Because output is deterministic and hashed, any party can
              verify that an artifact matches a canonical unit. A trusted third party is not required.
            </p>
            <p className="text-body">
              The reference renderer is not privileged. It demonstrates correctness and provides convenience, and it is
              evaluated by the same public rules as any other implementation.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">Summary</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body">
              The NexArt Canonical Renderer exists to provide a certification-grade reference implementation, reduce
              integration friction, and produce verified outputs for replay. Builders can use the public node or run
              their own. The protocol remains deterministic and verifiable regardless of which compliant renderer
              produces the output.
            </p>
          </div>
        </section>

        <section className="pt-8 border-t border-border">
          <p className="text-caption text-sm">
            Certified runs via the canonical renderer are subject to plan limits. See{" "}
            <Link to="/pricing" className="text-body underline underline-offset-2 hover:text-foreground">
              pricing
            </Link>{" "}
            for details.
          </p>
        </section>
      </PageContent>
    </PageLayout>
  );
};

export default CanonicalRenderer;
