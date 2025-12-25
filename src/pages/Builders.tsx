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
            This page is for developers, renderer authors, and researchers who want to build tools or applications that work with the NexArt protocol. It is orientation, not onboarding.
          </p>

          <h2>Who This Is For</h2>
          
          <p>
            The NexArt protocol is designed for:
          </p>
          
          <ul>
            <li>
              <strong>Renderer implementers</strong> building alternative renderers or embedding NexArt output in other systems
            </li>
            <li>
              <strong>Tool developers</strong> creating authoring environments, validators, or converters
            </li>
            <li>
              <strong>Archive and preservation projects</strong> seeking durable, self-describing art formats
            </li>
            <li>
              <strong>Platform developers</strong> integrating generative art into galleries, marketplaces, or exhibition systems
            </li>
            <li>
              <strong>Researchers</strong> studying determinism, reproducibility, or long-term software preservation
            </li>
          </ul>
          
          <p>
            You do not need to be an expert. You need clarity about what the protocol guarantees and what it does not.
          </p>

          <h2>What It Means to Build Against the Protocol</h2>
          
          <p>
            Building against the protocol means implementing behavior defined by the specification—reading canonical units, rendering systems, and producing conforming output.
          </p>
          
          <p>
            You are not required to implement everything. A renderer might support only Shapes mode. A tool might only validate systems, not render them. Partial implementations are expected and encouraged.
          </p>
          
          <p>
            The protocol distinguishes between what is <strong>enforced</strong> and what is <strong>reference behavior</strong>:
          </p>
          
          <ul>
            <li>
              <strong>Shapes</strong> and <strong>Artnames</strong> are protocol-enforced and stable. Conforming implementations must match the specification exactly.
            </li>
            <li>
              <strong>Code Mode v0.x</strong> is runtime-defined and deterministic, but not yet fully protocol-enforced. Implementations should follow the reference renderer.
            </li>
          </ul>
          
          <p>
            If you claim conformance to a mode, you must conform fully. If you claim determinism, you must deliver it.
          </p>

          <h2>Reference Implementation</h2>
          
          <p>
            <strong>nexart.xyz</strong> is the canonical reference implementation of the NexArt protocol. It defines correct rendering behavior for all modes, including those not yet fully specified at the protocol level.
          </p>
          
          <p>
            For Code Mode v0.x, nexart.xyz is authoritative. If your renderer produces different output for the same system, nexart.xyz is considered correct.
          </p>
          
          <p>
            For protocol-enforced modes (Shapes, Artnames), the specification is authoritative. nexart.xyz implements the specification; both should agree.
          </p>

          <h2>Code Mode Status</h2>
          
          <p>
            Code Mode exists in two states:
          </p>
          
          <ul>
            <li>
              <strong>Code Mode v0.x</strong> — The current runtime. Deterministic, stable in behavior, but defined by the reference implementation rather than a formal specification. Available now via the NexArt Code Mode Runtime SDK.
            </li>
            <li>
              <strong>Code Mode v1 (GSL Draft)</strong> — A proposed protocol-governed language. Not implemented. See the{" "}
              <a href="/code-mode-v1" className="text-link hover:text-link-hover underline underline-offset-2">GSL v1 Draft</a> for the design direction.
            </li>
          </ul>
          
          <p>
            Builders working with Code Mode today should target v0.x and expect future migration guidance when v1 stabilizes.
          </p>

          <h2>SDKs and Developer Tools</h2>
          
          <p>
            The <strong>NexArt Code Mode Runtime SDK</strong> is published and available via npm. It provides the runtime surface used by nexart.xyz for Code Mode execution.
          </p>
          
          <p>
            The SDK enables:
          </p>
          
          <ul>
            <li>Deterministic frame rendering for Static and Loop systems</li>
            <li>Consistent random number generation</li>
            <li>Time-normalized animation execution</li>
          </ul>
          
          <p>
            Additional SDKs for other modes and for canonical unit parsing are under development. Announcements will be made here when they are available.
          </p>

          <h2>Ways to Contribute Today</h2>
          
          <p>
            There are meaningful ways to participate now:
          </p>
          
          <ul>
            <li>
              <strong>Build a single-mode renderer</strong> — Implement Shapes or Artnames rendering and validate against the specification
            </li>
            <li>
              <strong>Create a validator</strong> — Write a tool that checks whether a canonical unit conforms to the protocol
            </li>
            <li>
              <strong>Test the SDK</strong> — Use the Code Mode Runtime SDK and report inconsistencies or unclear behavior
            </li>
            <li>
              <strong>Provide specification feedback</strong> — Read this documentation critically and identify what is unclear, incomplete, or incorrect
            </li>
            <li>
              <strong>Submit proposals</strong> — If you see a better way to define something, write it up
            </li>
          </ul>

          <h2>Lifecycle of a NexArt System</h2>
          
          <p>
            A NexArt system moves through these stages:
          </p>
          
          <p>
            <strong>Creation.</strong> An artist uses a tool (nexart.xyz or a third-party implementation) to author a system. The tool produces a canonical unit.
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

          <h2>Source Code and Repositories</h2>
          
          <p>
            The NexArt Code Mode Runtime SDK is available on npm. Protocol specifications and additional tooling will be published to public repositories as they stabilize.
          </p>
          
          <p>
            Repository links and contribution guidelines will be posted here when available.
          </p>

          <h2>How to Get Involved</h2>
          
          <p>
            Read this documentation. Understand what is stable, what is experimental, and what is proposed. Consider building a partial implementation or providing feedback on the specification.
          </p>
          
          <p>
            Protocol work is slow and deliberate. Early contributions—including reading, testing, and critique—are valuable.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Builders;
