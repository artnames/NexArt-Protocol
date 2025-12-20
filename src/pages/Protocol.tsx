import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Protocol = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Protocol Overview - NexArt Protocol</title>
        <meta name="description" content="The conceptual foundation of the NexArt protocol. Understanding systems, outputs, determinism, and versioning." />
      </Helmet>
      
      <PageHeader 
        title="Protocol Overview"
        subtitle="The mental model behind NexArt systems."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            This page defines the conceptual framework of the NexArt protocol. It explains what we mean when we talk about systems, why we distinguish them from outputs, and how we think about reproducibility.
          </p>

          <h2>What Is a NexArt System</h2>
          
          <p>
            A NexArt system is intended to be a complete, self-contained description of a generative artwork. It includes all the information necessary to produce visual output: the mode of generation, the parameters that control it, and any external references it depends on.
          </p>
          
          <p>
            A system is not an image. It is the specification from which images can be derived. The same system, given the same inputs, should produce the same visual result—or, in cases where perfect determinism is not possible, a result within an acceptable range of variation when tolerances are specified.
          </p>

          <h2>System vs. Output</h2>
          
          <p>
            The distinction between system and output is fundamental to NexArt. An output is a static artifact: an image, a video frame, a rendered moment. A system is dynamic: a set of rules that can be executed, paused, modified, and resumed.
          </p>
          
          <p>
            The protocol's goal is that when you save work in NexArt, you are saving a system—not just an image. Current implementations often store rendered outputs and metadata alongside system definitions. The protocol is evolving toward storing system definitions and reproducible inputs as the primary record, with rendered outputs treated as derived artifacts. Some systems are now governed by the protocol rather than the application.
          </p>
          
          <p>
            This has implications for preservation, ownership, and collaboration. A system can be verified, studied, and extended in ways that a static image cannot.
          </p>

          <h2>Why Systems Matter</h2>
          
          <p>
            Traditional digital art is fragile. File formats become obsolete. Rendering engines change. Dependencies disappear. An image saved today may not open tomorrow.
          </p>
          
          <p>
            NexArt systems are designed for durability. By defining art as executable specifications rather than static files, we create artifacts that can be re-rendered, ported to new platforms, and preserved across technological generations.
          </p>

          <h2>Determinism</h2>
          
          <p>
            A fully deterministic system produces identical output given identical input. This is the ideal, but not always achievable. Some generative processes depend on floating-point precision, hardware-specific rendering, or other factors that vary between environments.
          </p>
          
          <p>
            NexArt distinguishes between two categories:
          </p>
          
          <ul>
            <li>
              <strong>Deterministic systems</strong> — intended to produce identical output across all conforming implementations, when specified
            </li>
            <li>
              <strong>Best-effort systems</strong> — output may vary, but within documented tolerances when specified
            </li>
          </ul>
          
          <p>
            Both are valid. The protocol requires that each system declare which category it belongs to. Tolerance specifications are evolving and will be formalized in future versions.
          </p>

          <h2>Versioning</h2>
          
          <p>
            Behavior must be stable over time. When the protocol or a rendering engine changes, existing systems should continue to work as they did when created.
          </p>
          
          <p>
            NexArt uses versioning to freeze behavior. Each system records the protocol version it was created against. Implementations are expected to preserve backward compatibility with older versions, even as new features are added.
          </p>
          
          <p>
            Breaking changes are avoided. When they are unavoidable, they are introduced as new versions, leaving existing systems unaffected.
          </p>

          <h2>What This Means for Builders</h2>
          
          <p>
            If you are building tools, renderers, or applications that work with NexArt systems, you are committing to honor these principles: systems over outputs, explicit determinism guarantees, and stable versioning.
          </p>
          
          <p>
            The protocol does not dictate implementation details. How you render a system is up to you, as long as the output conforms to the specification.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Protocol;
