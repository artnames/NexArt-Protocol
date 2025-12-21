import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Builders = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Builders - NexArt Protocol</title>
        <meta name="description" content="For those who want to build against the NexArt protocol. Orientation for contributors and implementers." />
      </Helmet>
      
      <PageHeader 
        title="Builders"
        subtitle="For those who want to contribute."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            This page is for developers, artists, and researchers who want to build tools, renderers, or applications that work with the NexArt protocol. It is orientation, not onboarding. Detailed documentation will come later.
          </p>

          <h2>Who This Is For</h2>
          
          <p>
            The NexArt protocol is designed for:
          </p>
          
          <ul>
            <li>
              <strong>Creative technologists</strong> building tools for generative art
            </li>
            <li>
              <strong>Renderer implementers</strong> who want to support NexArt systems
            </li>
            <li>
              <strong>Archive and preservation projects</strong> seeking durable art formats
            </li>
            <li>
              <strong>Platform developers</strong> integrating generative art into larger systems
            </li>
            <li>
              <strong>Artists</strong> who work at the intersection of code and visual art
            </li>
          </ul>
          
          <p>
            You do not need to be an expert in any of these areas. You need curiosity, patience, and a willingness to work with incomplete specifications.
          </p>

          <h2>What It Means to Build Against the Protocol</h2>
          
          <p>
            Building "against" the protocol means implementing the specification—reading canonical units, rendering systems, and producing conforming output.
          </p>
          
          <p>
            You are not required to implement everything. A renderer might support only Shapes mode. A tool might only read systems, not create them. Partial implementations are welcome and encouraged.
          </p>
          
          <p>
            The specification is stable and enforced for certain system types (Shapes, Artnames). Other modes remain under development. What matters is that your implementation conforms to the protocol where it applies. If you support Shapes, you support Shapes fully. If you claim determinism, you deliver it.
          </p>
          
          <p>
            Code Mode v0.x is experimental. A protocol-governed Code Mode is defined in the{" "}
            <a href="/code-mode-v1" className="text-link hover:text-link-hover underline underline-offset-2">Code Mode v1 Draft</a>.
          </p>

          <h2>Ways to Contribute Now</h2>
          
          <p>
            Even at this early stage, there are meaningful ways to participate:
          </p>
          
          <ul>
            <li>
              <strong>Build a read-only parser</strong> — Implement a tool that reads and validates canonical units
            </li>
            <li>
              <strong>Prototype a single-mode renderer</strong> — Build a renderer that supports one mode (Shapes or Noise are good starting points)
            </li>
            <li>
              <strong>Create a validator</strong> — Write a tool that checks whether a canonical unit conforms to the specification
            </li>
            <li>
              <strong>Provide feedback</strong> — Read this documentation critically and share what is unclear, missing, or wrong
            </li>
            <li>
              <strong>Submit proposals</strong> — If you see a better way to define something, write it up
            </li>
          </ul>

          <h2>Lifecycle of a NexArt System</h2>
          
          <p>
            At a high level, a NexArt system moves through these stages:
          </p>
          
          <p>
            <strong>Creation.</strong> An artist uses a tool (the NexArt app or a third-party implementation) to author a system. The tool produces a canonical unit.
          </p>
          
          <p>
            <strong>Storage.</strong> The canonical unit is saved—locally, on a server, on-chain, or elsewhere. The format may vary, but the information is preserved.
          </p>
          
          <p>
            <strong>Transmission.</strong> The canonical unit is shared, copied, or moved. Because it is self-contained, it can be transmitted without loss.
          </p>
          
          <p>
            <strong>Rendering.</strong> A renderer reads the canonical unit and produces visual output. This may be real-time display, video export, or static image generation.
          </p>
          
          <p>
            <strong>Archiving.</strong> For long-term preservation, the canonical unit is stored with its dependencies and version metadata. Future renderers can reconstruct the original output.
          </p>

          <h2>SDKs and Tools</h2>
          
          <p>
            Reference implementations, SDKs, and developer tools are planned but not yet available. The current focus is on stabilizing the specification.
          </p>
          
          <p>
            When tools are ready, they will be announced here and published to a public repository.
          </p>

          <h2>Source Code</h2>
          
          <p>
            The protocol specification and reference implementations will be open source. A GitHub repository is being prepared.
          </p>
          
          <p>
            <span className="text-caption">Repository link: coming soon</span>
          </p>
          
          <p>
            The repository will include the specification, reference implementations as they stabilize, and contribution guidelines.
          </p>

          <h2>How to Get Involved</h2>
          
          <p>
            Read this documentation, think about what you might build, and consider starting a partial implementation or providing feedback.
          </p>
          
          <p>
            If you have questions, feedback, or proposals, contact channels will be established as the project develops.
          </p>
          
          <p>
            Building a protocol is slow work. Early contributions—even reading and critique—are valuable.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Builders;
