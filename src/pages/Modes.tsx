import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Modes = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Modes - NexArt Protocol</title>
        <meta name="description" content="The creation primitives of NexArt: SoundArt, Code Mode, Shapes, Fluids, Noise, and Artnames. Each mode is first-class." />
      </Helmet>
      
      <PageHeader 
        title="Modes"
        subtitle="The creation primitives of NexArt."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt supports multiple creation modes. Each mode is a distinct way of authoring generative systems, with its own inputs, behaviors, and guarantees. All modes are first-class: none is more fundamental than another.
          </p>
          
          <p>
            This page describes each mode at a conceptual level. Implementation details and parameter specifications will be documented separately.
          </p>

          <h2>SoundArt</h2>
          
          <p>
            <strong>Intent.</strong> SoundArt creates visual systems driven by audio input. The artwork responds to frequency, amplitude, rhythm, and other properties of sound.
          </p>
          
          <p>
            <strong>Inputs.</strong> An audio source (live or recorded), a visual template, and parameters that map audio features to visual properties.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Given the same audio file and parameters, a SoundArt system will produce the same visual output. With live audio, the output is reactive and non-deterministic.
          </p>
          
          <p>
            <strong>Limitations.</strong> SoundArt systems depend on audio analysis, which may vary slightly between implementations. The protocol specifies analysis methods to minimize variance.
          </p>

          <h2>Code Mode</h2>
          
          <p>
            <strong>Intent.</strong> Code Mode allows direct specification of generative logic through code. It provides maximum control for technically sophisticated artists.
          </p>
          
          <p>
            <strong>Inputs.</strong> A code definition in a supported language or DSL, along with any external dependencies.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Determinism depends on the code itself. The protocol does not guarantee deterministic execution if the code uses non-deterministic operations.
          </p>
          
          <p>
            <strong>Limitations.</strong> Code execution environments may differ between implementations. The protocol will define a sandboxed execution model in future versions.
          </p>

          <h2>Shapes</h2>
          
          <p>
            <strong>Intent.</strong> Shapes provides geometric primitives for visual composition. Systems are built from circles, rectangles, lines, and other basic forms.
          </p>
          
          <p>
            <strong>Inputs.</strong> A set of shape definitions with position, size, color, and transformation parameters.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Shapes systems are fully deterministic. The same parameters produce identical output across all conforming implementations.
          </p>
          
          <p>
            <strong>Limitations.</strong> Shapes is intentionally constrained. Complex generative behavior requires combining shapes with other modes or using Code Mode.
          </p>

          <h2>Fluids</h2>
          
          <p>
            <strong>Intent.</strong> Fluids simulates liquid dynamics for organic, flowing visuals. Systems exhibit natural-looking motion and interaction.
          </p>
          
          <p>
            <strong>Inputs.</strong> Simulation parameters (viscosity, density, velocity) and initial conditions.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Fluids systems are best-effort deterministic. Small floating-point differences may accumulate over time, leading to divergent outputs on different hardware.
          </p>
          
          <p>
            <strong>Limitations.</strong> Long-running simulations may drift. For archival purposes, checkpointing is recommended.
          </p>

          <h2>Noise</h2>
          
          <p>
            <strong>Intent.</strong> Noise generates textures and patterns using procedural noise functions: Perlin, Simplex, Worley, and others.
          </p>
          
          <p>
            <strong>Inputs.</strong> Noise type, frequency, amplitude, octaves, and seed values.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Noise systems are deterministic when a seed is specified. The same seed produces identical noise across implementations.
          </p>
          
          <p>
            <strong>Limitations.</strong> The protocol specifies exact noise algorithms to ensure consistency. Custom noise functions must be implemented via Code Mode.
          </p>

          <h2>Artnames</h2>
          
          <p>
            <strong>Intent.</strong> Artnames generates visual systems from text input. A name, phrase, or arbitrary string is transformed into visual parameters through hashing and mapping functions.
          </p>
          
          <p>
            <strong>Inputs.</strong> A text string and a mapping configuration that determines how text features become visual properties.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Artnames systems are fully deterministic. The same string always produces the same visual output.
          </p>
          
          <p>
            <strong>Limitations.</strong> The visual vocabulary is constrained by the mapping configuration. Artnames is generative but not infinitely expressive.
          </p>

          <h2>Mode Parity</h2>
          
          <p>
            All modes produce canonical units. All modes are versioned. All modes declare their determinism guarantees. There is no hierarchy among modes—each is a complete and independent way to create NexArt systems.
          </p>
          
          <p>
            Future modes may be added to the protocol. The framework is designed to accommodate new creation primitives without disrupting existing ones.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Modes;
