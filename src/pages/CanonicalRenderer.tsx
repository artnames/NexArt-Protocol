import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const CanonicalRenderer = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>NexArt Canonical Renderer</title>
        <meta
          name="description"
          content="The NexArt Canonical Renderer is a reference implementation of the protocol's deterministic rendering pipeline."
        />
      </Helmet>

      <PageHeader
        title="NexArt Canonical Renderer"
        subtitle="A reference implementation of the NexArt protocol's deterministic rendering pipeline."
      />

      <PageContent>
        {/* What the Canonical Renderer Is */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            What the Canonical Renderer Is
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              The Canonical Renderer is a reference implementation of the NexArt protocol's rendering pipeline. It converts a NexArt snapshot into an image.
            </p>
            <p className="text-body mb-4">
              The renderer is fully deterministic: identical input always produces identical output. Given the same snapshot and seed, the renderer will produce byte-for-byte identical image data across any number of invocations.
            </p>
            <p className="text-body">
              Each render operation returns both the image bytes and a cryptographic hash of the output. This hash serves as a verifiable fingerprint, allowing any party to independently confirm that a given image was produced from a specific snapshot.
            </p>
          </div>
        </section>

        {/* Why NexArt Provides a Reference Renderer */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Why NexArt Provides a Reference Renderer
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              NexArt operates a public reference renderer to lower the barrier for builders. By providing a working implementation, we establish a shared standard that makes integrations straightforward and reduces the infrastructure work required to get started.
            </p>
            <p className="text-body mb-4">
              The reference renderer exists as a convenience, not a dependency. Builders can use it to test, prototype, and ship without needing to provision their own infrastructure. However, NexArt is not architecturally dependent on this node, and builders are not required to use it.
            </p>
            <p className="text-body">
              This approach allows new builders to focus on their applications while the protocol remains open for those who want more control.
            </p>
          </div>
        </section>

        {/* Using the Reference Renderer */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Using the Reference Renderer
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              The reference renderer is suitable for early builders, testing, previews, and small-scale production use. No setup is required — builders can send snapshots and receive rendered images immediately.
            </p>
            <p className="text-body mb-4">
              The reference node is operated on a best-effort basis. While we aim for consistent availability, there are no hard guarantees around uptime or throughput. Builders with production requirements that demand specific performance characteristics should consider running their own renderer.
            </p>
            <p className="text-body">
              The reference renderer implements the same protocol specification as any compliant renderer. Output produced by the reference node is identical to output produced by any other correctly implemented renderer given the same input.
            </p>
          </div>
        </section>

        {/* Running Your Own Renderer */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Running Your Own Renderer
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              NexArt does not require builders to run their own renderer — but it is designed so they can.
            </p>
            <p className="text-body mb-4">
              The rendering pipeline is open and reproducible. Builders who want control over their infrastructure, performance guarantees, or isolation from shared resources can deploy their own compliant renderer. Self-hosted renderers produce output that is indistinguishable from the reference node.
            </p>
            <p className="text-body mb-4">
              Running your own renderer provides:
            </p>
            <ul className="list-disc pl-6 text-body mb-4 space-y-2">
              <li>Full control over availability and scaling</li>
              <li>Performance guarantees tailored to your requirements</li>
              <li>Isolation from other builders' workloads</li>
              <li>The ability to operate independently of NexArt infrastructure</li>
            </ul>
            <p className="text-body">
              Self-hosting is optional. The choice between using the reference renderer and running your own is purely operational — the protocol does not distinguish between them.
            </p>
          </div>
        </section>

        {/* Protocol Philosophy */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Protocol Philosophy
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body mb-4">
              NexArt is not tied to a single rendering service. The protocol defines the input format, the execution model, and the output specification. Any renderer that correctly implements this specification will produce valid, identical output.
            </p>
            <p className="text-body mb-4">
              Trust in NexArt does not come from authority — it comes from determinism and cryptographic verification. Because rendering is deterministic and outputs are hashed, anyone can verify that a given image corresponds to a specific snapshot. No trusted third party is required.
            </p>
            <p className="text-body">
              The reference renderer is not privileged. It implements the same public specification as any other renderer. Its role is to demonstrate correctness and provide convenience, not to serve as a gatekeeper.
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Summary
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-body">
              The NexArt Canonical Renderer exists to make building easier — not to centralize control. It is a reference implementation that demonstrates the protocol, lowers the barrier for new builders, and provides a shared standard for the ecosystem. Builders who need more control can run their own renderer at any time. The protocol remains open, deterministic, and verifiable regardless of which renderer produces the output.
            </p>
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
};

export default CanonicalRenderer;
