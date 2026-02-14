import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const CanonicalUnit = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Canonical Unit | Portable Protocol Object"
        description="The canonical unit is NexArt’s core protocol object. A portable specification of a deterministic generative system, designed for reproducible execution, verification, and interoperability."
      />

      <PageHeader title="Canonical Unit" subtitle="The core protocol object." />

      <PageContent>
        <div className="prose-protocol">
          <p>
            The canonical unit is the fundamental object of the NexArt protocol. Every system executed, stored, or
            transmitted through NexArt is represented as a canonical unit. This page defines what it is, what it
            contains, and what it intentionally excludes.
          </p>

          <p>
            The canonical unit is application-independent. The protocol, not the user interface, defines system meaning.
          </p>

          <h2>Definition</h2>

          <p>
            A canonical unit is a complete, portable specification of a deterministic generative system. It contains
            everything required to reproduce the output of that system, and nothing more. Reproducibility requires a
            determinism declaration and resolvable external references when used.
          </p>

          <p>
            The canonical unit is mode-agnostic. Whether a system was authored using SoundArt, Code Mode, Shapes, or any
            other creation primitive, it is represented in the same fundamental structure.
          </p>

          <h2>What It Contains</h2>

          <p>The protocol requires every canonical unit to include:</p>

          <ul>
            <li>
              <strong>Mode identifier</strong>, which creation primitive produced the system
            </li>
            <li>
              <strong>Parameters</strong>, the complete set of values that define the system’s behavior
            </li>
            <li>
              <strong>Protocol version</strong>, the protocol version this system conforms to
            </li>
            <li>
              <strong>Determinism declaration</strong>, whether the system is deterministic or best-effort
            </li>
            <li>
              <strong>External references</strong>, pointers to any required assets such as audio files or images
            </li>
          </ul>

          <h2>What It Does Not Contain</h2>

          <p>The protocol requires canonical units to exclude:</p>

          <ul>
            <li>
              <strong>Rendered outputs</strong>, images, videos, or other artifacts derived from the system
            </li>
            <li>
              <strong>Implementation details</strong>, how a particular renderer or tool processes the system
            </li>
            <li>
              <strong>User interface state</strong>, view settings, window positions, or other ephemeral data
            </li>
            <li>
              <strong>Authentication or access control</strong>, ownership and permissions are handled externally
            </li>
            <li>
              <strong>Embedded binary assets</strong>, external references are used instead to keep units portable
            </li>
          </ul>

          <h2>Why This Abstraction Exists</h2>

          <p>The canonical unit serves several purposes:</p>

          <p>
            <strong>Portability.</strong> A canonical unit can be moved between tools, platforms, and storage systems
            without loss of meaning. It is self-describing and self-contained.
          </p>

          <p>
            <strong>Verifiability.</strong> Because the unit includes parameters and declarations, completeness can be
            checked. A renderer can validate that it has everything needed before execution.
          </p>

          <p>
            <strong>Durability.</strong> By excluding rendered outputs and implementation details, the canonical unit
            preserves what matters long term, the rules that define the system.
          </p>

          <p>
            <strong>Interoperability.</strong> Different tools can read and write canonical units even when their
            renderers and interfaces differ.
          </p>

          <h2>Mode Conformance</h2>

          <p>
            The protocol requires all creation modes in NexArt to produce canonical units. Implementations are being
            migrated to conform to this requirement. Modes differ in how systems are authored, but they converge on a
            shared representation so that systems can be stored, shared, and processed uniformly.
          </p>

          <h2>Current Status</h2>

          <p>
            The canonical unit structure described here represents the protocol requirements. Implementations are being
            migrated to fully conform to this specification. Some implementations may store additional data alongside
            the canonical unit during the transition period.
          </p>

          <h2>Serialization</h2>

          <p>
            The protocol does not mandate a specific serialization format. Implementations may use JSON, binary formats,
            or other representations, as long as they can round-trip a canonical unit without loss of information.
          </p>

          <p>Reference implementations may be provided separately.</p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CanonicalUnit;
