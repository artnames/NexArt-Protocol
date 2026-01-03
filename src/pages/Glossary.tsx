import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const Glossary = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Glossary – NexArt Protocol</title>
        <meta name="description" content="Clear, unambiguous definitions for key terms used throughout the NexArt protocol documentation." />
      </Helmet>
      
      <PageHeader 
        title="Glossary" 
        subtitle="Definitions for key terms used throughout the NexArt protocol documentation. Each term defines how the word is used in NexArt, even if it differs from common usage elsewhere."
      />
      
      <PageContent>
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">System</h2>
          <p className="text-body mb-4">
            A generative specification that defines behavior, not output. A system describes how visual output should be produced given a set of inputs, parameters, and rules.
          </p>
          <p className="text-body mb-4">
            Systems are declarative: they specify what should happen, not what has happened. The same system, executed under the same conditions, should produce consistent results according to its declared determinism level.
          </p>
          <p className="text-body">
            In NexArt, the system is the primary creative artifact. Outputs are derived; systems are authored.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Canonical Unit</h2>
          <p className="text-body mb-4">
            The protocol-level representation of a NexArt system. A canonical unit is a structured object that encodes everything the protocol requires to identify, validate, and reproduce a system.
          </p>
          <p className="text-body mb-4">
            Canonical units include metadata such as mode, protocol version, creation context, and declared determinism. They reference external inputs where applicable and declare whether full reproducibility is guaranteed or best-effort.
          </p>
          <p className="text-body">
            The canonical unit is the fundamental exchange format. All compliant implementations must be able to read, write, or validate canonical units according to their role.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Output</h2>
          <p className="text-body mb-4">
            A rendered artifact derived from executing a system. Outputs are the visual (or audiovisual) results of running a system through a renderer.
          </p>
          <p className="text-body mb-4">
            Outputs may be images, videos, or real-time visual streams. They are products of systems, not protocol objects themselves. The protocol concerns itself with systems; outputs are implementation details.
          </p>
          <p className="text-body">
            Storing or distributing outputs is outside the protocol's scope. What matters to the protocol is that outputs can be regenerated from systems under specified conditions.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Deterministic System</h2>
          <p className="text-body mb-4">
            A system that guarantees identical output given identical inputs, under specified conditions. A deterministic system, when executed by conforming renderers with the same inputs, will always produce the same result.
          </p>
          <p className="text-body mb-4">
            Determinism in NexArt is conditional. It depends on renderer conformance, specified rendering rules, and the stability of external references. A system's determinism declaration is a contract, not an automatic property.
          </p>
          <p className="text-body">
            HARD enforced modes—Shapes, Noise, SoundArt, and Code Mode—are fully deterministic and rendered exclusively via the NexArt Code Mode runtime under Protocol v1.2.0. No arbitrary rendering logic is permitted.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Best-Effort System</h2>
          <p className="text-body mb-4">
            A system that aims for reproducibility but cannot guarantee identical output in all environments. Best-effort systems are honest about the limits of their reproducibility.
          </p>
          <p className="text-body mb-4">
            Factors such as floating-point precision, hardware differences, audio analysis variations, or unpinned dependencies may cause outputs to differ slightly across executions or renderers.
          </p>
          <p className="text-body">
            Best-effort is not a failure state. Many valuable systems—particularly those involving real-time audio, procedural fluids, or user-provided code—are inherently best-effort. The protocol values honesty over false guarantees.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Renderer</h2>
          <p className="text-body mb-4">
            An implementation that executes a NexArt system and produces visual output. A renderer reads a canonical unit, interprets its mode-specific parameters, and generates the corresponding output.
          </p>
          <p className="text-body mb-4">
            Multiple renderers may exist for the same mode. The protocol does not mandate a single rendering engine. However, for deterministic systems, renderers must conform to specified rendering rules to produce consistent results.
          </p>
          <p className="text-body">
            Renderers may be embedded in applications, run as standalone tools, or operate as services. The protocol is agnostic to renderer architecture.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Implementation</h2>
          <p className="text-body mb-4">
            Any software that reads, writes, validates, or renders NexArt systems. Implementations include renderers, editors, validators, archivers, and tools that interact with canonical units.
          </p>
          <p className="text-body mb-4">
            An implementation does not need to support all modes or all protocol features. Partial implementations—such as a read-only parser or a validator for a single mode—are valid and encouraged.
          </p>
          <p className="text-body">
            The protocol specifies what implementations must do to be conforming in their declared scope. It does not require any single implementation to do everything.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Protocol Version</h2>
          <p className="text-body mb-4">
            The version of the NexArt specification a system conforms to. Every canonical unit declares its protocol version, allowing implementations to interpret it correctly.
          </p>
          <p className="text-body mb-4">
            Protocol versions are immutable once released. A system authored under v0.1 remains a v0.1 system. Future protocol versions may add features or modes but must maintain backward compatibility with existing systems.
          </p>
          <p className="text-body">
            Versioning ensures that systems remain interpretable over time. Deprecation, when necessary, will be explicit, documented, and gradual.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">External Reference</h2>
          <p className="text-body mb-4">
            A pointer to data required by a system but stored outside the canonical unit. External references include audio files, text sources, or other assets that a system depends on for execution.
          </p>
          <p className="text-body mb-4">
            External references introduce reproducibility dependencies. A system that references external audio can only be fully reproduced if that audio remains accessible and unchanged.
          </p>
          <p className="text-body">
            The protocol encourages content-addressable references (such as hashes) where possible, and requires systems to declare their external dependencies explicitly.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Mode</h2>
          <p className="text-body mb-4">
            A creation primitive that defines how systems are authored. Each mode—SoundArt, Code Mode, Shapes, Fluids, Noise, Artnames—provides a distinct set of inputs, parameters, and behaviors.
          </p>
          <p className="text-body mb-4">
            Modes are not plugins or extensions. They are first-class protocol primitives, each with defined semantics and determinism characteristics. HARD enforced modes (Shapes, Noise, SoundArt, Code Mode) execute through the shared NexArt Code Mode runtime under Protocol v1.2.0.
          </p>
          <p className="text-body">
            All modes produce canonical units that conform to the protocol structure, but each mode's internal parameters and rendering requirements differ according to its nature.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">SoundArt</h2>
          <p className="text-body mb-4">
            A protocol-enforced mode for audio-reactive generative systems. SoundArt is now fully protocol-enforced, rendered exclusively via the NexArt Code Mode runtime.
          </p>
          <p className="text-body mb-4">
            Audio input is normalized into a frozen SoundSnapshot and injected into the runtime as read-only parameters. All outputs are deterministic, seeded, and verifiable under the NexArt protocol. There are no Canvas2D or legacy rendering paths.
          </p>
          <p className="text-body">
            Identical audio input and seed always produce identical visual output.
          </p>
        </section>

        <section className="pt-8 border-t border-border">
          <p className="text-caption text-sm">
            Definitions may evolve as the protocol matures. Changes to terminology will be documented and versioned alongside the specification. Where a term's meaning shifts, prior usage will remain valid for systems authored under earlier protocol versions.
          </p>
        </section>
      </PageContent>
    </PageLayout>
  );
};

export default Glossary;
