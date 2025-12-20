import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const CanonicalUnit = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Canonical Unit - NexArt Protocol</title>
        <meta name="description" content="The core protocol object of NexArt. What a system contains, what it excludes, and why this abstraction exists." />
      </Helmet>
      
      <PageHeader 
        title="Canonical Unit"
        subtitle="The core protocol object."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            The canonical unit is the fundamental object of the NexArt protocol. Every piece of work created, stored, or transmitted through NexArt is represented as a canonical unit. This page defines what it is, what it contains, and what it intentionally excludes.
          </p>

          <h2>Definition</h2>
          
          <p>
            A canonical unit is a complete, portable specification of a generative art system. It contains everything needed to reproduce the visual output of that system, and nothing more.
          </p>
          
          <p>
            The canonical unit is mode-agnostic. Whether a system was created using SoundArt, Code Mode, Shapes, or any other creation primitive, it is represented in the same fundamental structure.
          </p>

          <h2>What It Contains</h2>
          
          <p>
            Every canonical unit includes:
          </p>
          
          <ul>
            <li>
              <strong>Mode identifier</strong> — which creation primitive generated this system
            </li>
            <li>
              <strong>Parameters</strong> — the complete set of values that define the system's behavior
            </li>
            <li>
              <strong>Protocol version</strong> — which version of the NexArt protocol this system conforms to
            </li>
            <li>
              <strong>Determinism declaration</strong> — whether the system is deterministic or best-effort
            </li>
            <li>
              <strong>External references</strong> — pointers to any assets the system depends on (audio files, images, etc.)
            </li>
          </ul>

          <h2>What It Does Not Contain</h2>
          
          <p>
            The canonical unit intentionally excludes:
          </p>
          
          <ul>
            <li>
              <strong>Rendered outputs</strong> — images, videos, or other artifacts derived from the system
            </li>
            <li>
              <strong>Implementation details</strong> — how a particular renderer or tool processes the system
            </li>
            <li>
              <strong>User interface state</strong> — view settings, window positions, or other ephemeral data
            </li>
            <li>
              <strong>Authentication or access control</strong> — ownership and permissions are handled externally
            </li>
            <li>
              <strong>Embedded binary assets</strong> — external references are used instead to keep units portable
            </li>
          </ul>

          <h2>Why This Abstraction Exists</h2>
          
          <p>
            The canonical unit serves several purposes:
          </p>
          
          <p>
            <strong>Portability.</strong> A canonical unit can be moved between tools, platforms, and storage systems without loss of information. It is self-describing and self-contained.
          </p>
          
          <p>
            <strong>Verifiability.</strong> Because the unit contains all parameters, its correctness can be checked. A renderer can validate that it has everything needed before attempting to process the system.
          </p>
          
          <p>
            <strong>Durability.</strong> By excluding rendered outputs and implementation details, the canonical unit focuses on what matters for long-term preservation: the rules that define the artwork.
          </p>
          
          <p>
            <strong>Interoperability.</strong> Different tools can read and write canonical units, even if they implement different rendering strategies or user interfaces.
          </p>

          <h2>Mode Conformance</h2>
          
          <p>
            All creation modes in NexArt produce canonical units. This is a requirement of the protocol, not an optional feature. When you work in SoundArt mode, you are producing a canonical unit. When you work in Code Mode, you are producing a canonical unit.
          </p>
          
          <p>
            The modes differ in how systems are authored, but they converge on the same output format. This ensures that systems created in different modes can be stored, shared, and processed uniformly.
          </p>

          <h2>Serialization</h2>
          
          <p>
            The protocol does not mandate a specific serialization format. Implementations may use JSON, binary formats, or other representations, as long as they can round-trip a canonical unit without loss of information.
          </p>
          
          <p>
            Reference implementations will be provided in future versions of this specification.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CanonicalUnit;
