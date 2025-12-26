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

          <h2>What Is the NexArt Protocol</h2>
          
          <p>
            The NexArt protocol defines generative systems, not just outputs. A NexArt artwork is a canonical system—a complete, self-describing unit that can be re-rendered in the future with identical results.
          </p>
          
          <p>
            The protocol guarantees:
          </p>
          
          <ul>
            <li>
              <strong>Determinism</strong> — The same input produces the same output, always
            </li>
            <li>
              <strong>Versioning</strong> — Systems declare their runtime version; renderers respect it
            </li>
            <li>
              <strong>Reproducibility</strong> — A canonical unit can be archived, transmitted, and rendered decades later
            </li>
          </ul>
          
          <p>
            Interfaces are replaceable. The protocol is not. Renderers may change, tools may evolve, but a conforming system will always produce the same visual output when executed correctly.
          </p>

          <h2>Canonical vs Exploratory Rendering</h2>
          
          <p>
            Not all renderers are equal. The NexArt protocol explicitly distinguishes between two categories:
          </p>
          
          <ul>
            <li>
              <strong>Canonical renderers</strong> — Archival, protocol-enforced. These produce output that can be trusted for long-term preservation and verification. Same input, same output, forever.
            </li>
            <li>
              <strong>Exploratory renderers</strong> — UI-first, non-archival. These are designed for rapid prototyping, education, and creative exploration. Output is deterministic but not canonical.
            </li>
          </ul>
          
          <p>
            This distinction is intentional and foundational. Canonical rendering requires controlled execution environments. Exploratory rendering prioritizes accessibility and speed.
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

          <h2>Official SDKs</h2>
          
          <p>
            NexArt provides two official SDKs, each with a distinct role. The split is intentional, not a limitation.
          </p>

          <h3>@nexart/codemode-sdk — Canonical Runtime (Node.js)</h3>
          
          <p>
            <strong>Purpose:</strong> Canonical, deterministic rendering
          </p>
          
          <p>
            <strong>Environment:</strong> Node.js only
          </p>
          
          <p>
            <strong>Output:</strong> PNG / MP4 buffers
          </p>
          
          <p>
            This SDK is used in production at nexart.xyz. It is the reference execution environment for the NexArt Protocol.
          </p>
          
          <p>
            <strong>Guarantees:</strong>
          </p>
          
          <ul>
            <li>Same input → same output, forever</li>
            <li>Archival correctness</li>
            <li>Protocol enforcement</li>
          </ul>
          
          <p>
            This SDK is not designed for browsers or edge runtimes.
          </p>
          
          <p>
            <strong>Links:</strong>
          </p>
          
          <ul>
            <li>
              npm: <a href="https://www.npmjs.com/package/@nexart/codemode-sdk" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">@nexart/codemode-sdk</a>
            </li>
            <li>
              GitHub: <a href="https://github.com/artnames/nexart-codemode-sdk" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">artnames/nexart-codemode-sdk</a>
            </li>
          </ul>
          
          <p className="font-semibold">
            This SDK is the reference execution environment for the NexArt Protocol.
          </p>

          <h3>@nexart/ui-renderer — Exploratory Renderer (Browser)</h3>
          
          <p>
            <strong>Purpose:</strong> Exploration, UI, education, rapid prototyping
          </p>
          
          <p>
            <strong>Environment:</strong> Browser only
          </p>
          
          <p>
            Uses Canvas and Web APIs. Deterministic but non-canonical. Explicitly not archival.
          </p>
          
          <p>
            <strong>Ideal for:</strong>
          </p>
          
          <ul>
            <li>Mini-apps</li>
            <li>Experiments</li>
            <li>Learning</li>
            <li>Creative tools</li>
          </ul>
          
          <p>
            <strong>Links:</strong>
          </p>
          
          <ul>
            <li>
              npm: <a href="https://www.npmjs.com/package/@nexart/ui-renderer" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">@nexart/ui-renderer</a>
            </li>
            <li>
              GitHub: <a href="https://github.com/artnames/nexart-ui-renderer" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">artnames/nexart-ui-renderer</a>
            </li>
          </ul>
          
          <p className="font-semibold">
            Output from this SDK is non-canonical and must not be used for archival or protocol claims.
          </p>

          <h2>Which SDK Should I Use?</h2>
          
          <ul>
            <li>
              <strong>"I want permanent, verifiable artwork"</strong> → @nexart/codemode-sdk
            </li>
            <li>
              <strong>"I want to prototype or build a UI"</strong> → @nexart/ui-renderer
            </li>
            <li>
              <strong>"I want both"</strong> → Use the UI renderer for exploration, canonical SDK for final execution
            </li>
          </ul>

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
              <strong>Test the SDKs</strong> — Use either SDK and report inconsistencies or unclear behavior
            </li>
            <li>
              <strong>Provide specification feedback</strong> — Read this documentation critically and identify what is unclear, incomplete, or incorrect
            </li>
            <li>
              <strong>Submit proposals</strong> — If you see a better way to define something, write it up
            </li>
          </ul>

          <h2>Built With the NexArt Protocol</h2>
          
          <p>
            The first third-party application built on the NexArt protocol is live:
          </p>
          
          <p>
            <a href="https://builtwithnexartprotocol.xyz" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">builtwithnexartprotocol.xyz</a>
          </p>
          
          <p>
            Early builders help shape the protocol. Experiment, build tools, and share what you create. The protocol evolves through use.
          </p>

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
            Official NexArt SDKs are available on npm and GitHub:
          </p>
          
          <ul>
            <li>
              <a href="https://github.com/artnames/nexart-codemode-sdk" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">nexart-codemode-sdk</a> — Canonical runtime (Node.js)
            </li>
            <li>
              <a href="https://github.com/artnames/nexart-ui-renderer" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">nexart-ui-renderer</a> — Exploratory renderer (Browser)
            </li>
          </ul>
          
          <p>
            Protocol specifications and additional tooling will be published to public repositories as they stabilize.
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
