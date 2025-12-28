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
            NexArt supports multiple creation modes. Each mode is a distinct way of authoring generative systems, with its own inputs, behaviors, and guarantees. All modes are intended to be first-class: none is more fundamental than another.
          </p>
          
          <p>
            This page describes each mode at a conceptual level. Implementation details and parameter specifications will be documented separately.
          </p>

          <h2>SoundArt</h2>
          
          <div className="bg-muted/50 border border-border rounded-md p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>Protocol Enforcement:</strong> Hard<br />
              SoundArt is executed exclusively via the NexArt Code Mode engine. No fallback renderers or alternative execution paths are permitted.
            </p>
          </div>
          
          <p>
            SoundArt is a protocol-enforced NexArt mode for audio-reactive generative systems.
          </p>
          
          <p>
            All SoundArt works are executed through the NexArt Code Mode runtime, using deterministic system generation, seeded randomness, and immutable audio snapshots.
          </p>
          
          <p>
            SoundArt no longer relies on custom Canvas renderers or legacy pipelines. Every output is reproducible, verifiable, and protocol-native.
          </p>

          <h3>Determinism & Verifiability</h3>
          
          <p>
            SoundArt systems are generated deterministically from audio analysis inputs. Audio features are normalized into a frozen SoundSnapshot, injected into the runtime as read-only parameters, and rendered using seeded randomness and deterministic noise functions.
          </p>
          
          <p>
            Identical audio input and seed always produce identical visual output.
          </p>

          <h2>Code Mode</h2>
          
          <div className="bg-muted/50 border border-border rounded-md p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>Status:</strong> Experimental (v0.x). Not protocol-governed.<br />
              See <a href="/code-mode-v1" className="text-link hover:text-link-hover underline underline-offset-2">Code Mode v1 (Draft)</a> for the proposed protocol specification.
            </p>
          </div>
          
          <p>
            <strong>Intent.</strong> Code Mode allows direct specification of generative logic through code. It provides maximum control for technically sophisticated artists.
          </p>
          
          <p>
            <strong>Inputs.</strong> A code definition in a supported language or DSL, along with any external dependencies.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Determinism depends entirely on the code itself. The protocol does not guarantee deterministic execution if the code uses non-deterministic operations.
          </p>
          
          <p>
            <strong>Limitations.</strong> Code execution environments may differ between implementations. Sandbox environments and dependency pinning are evolving; future versions of the protocol will define a standardized execution model.
          </p>

          <h2>Shapes</h2>
          
          <p>
            <strong>Intent.</strong> Shapes provides geometric primitives for visual composition. Systems are built from circles, rectangles, lines, and other basic forms.
          </p>
          
          <p>
            <strong>Inputs.</strong> A set of shape definitions with position, size, color, and transformation parameters.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Shapes systems are intended to be fully deterministic. The same parameters should produce identical output across conforming implementations, under standardized primitive definitions and rasterization rules.
          </p>
          
          <p>
            <strong>Limitations.</strong> Shapes is intentionally constrained. Complex generative behavior requires combining shapes with other modes or using Code Mode. Rasterization rules are being standardized.
          </p>

          <h2>Fluids</h2>
          
          <p>
            <strong>Intent.</strong> Fluids simulates liquid dynamics for organic, flowing visuals. Systems exhibit natural-looking motion and interaction.
          </p>
          
          <p>
            <strong>Inputs.</strong> Simulation parameters (viscosity, density, velocity) and initial conditions.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Fluids systems are best-effort reproducible. Floating-point differences across hardware may cause simulations to diverge over time, even with identical initial conditions.
          </p>
          
          <p>
            <strong>Limitations.</strong> Long-running simulations may drift. Checkpointing for archival purposes is a future consideration and is not currently implemented.
          </p>

          <h2>Noise</h2>
          
          <p>
            <strong>Intent.</strong> Noise generates textures and patterns using procedural noise functions: Perlin, Simplex, Worley, and others.
          </p>
          
          <p>
            <strong>Inputs.</strong> Noise type, frequency, amplitude, octaves, and seed values.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Noise systems are deterministic when algorithm and seed are pinned and specified. The same seed should produce identical noise across conforming implementations.
          </p>
          
          <p>
            <strong>Limitations.</strong> The protocol intends to specify exact noise algorithms to ensure consistency. Custom noise functions must be implemented via Code Mode.
          </p>

          <h2>Artnames</h2>
          
          <p>
            <strong>Intent.</strong> Artnames generates visual systems from text input. A name, phrase, or arbitrary string is transformed into visual parameters through hashing and mapping functions.
          </p>
          
          <p>
            <strong>Inputs.</strong> A text string and a mapping configuration that determines how text features become visual properties.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Artnames systems are deterministic under the specified mapping version. The same string always produces the same visual output when the mapping is fixed.
          </p>
          
          <p>
            <strong>Limitations.</strong> The visual vocabulary is constrained by the mapping configuration. Artnames is generative but not infinitely expressive.
          </p>

          <h2>Enforcement Status</h2>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium">Mode</th>
                  <th className="text-left py-2 pr-4 font-medium">Protocol Enforcement</th>
                  <th className="text-left py-2 font-medium">Runtime</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Code Mode</td>
                  <td className="py-2 pr-4">Hard</td>
                  <td className="py-2">NexArt Runtime</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">SoundArt</td>
                  <td className="py-2 pr-4">Hard</td>
                  <td className="py-2">NexArt Runtime</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Shapes</td>
                  <td className="py-2 pr-4">Hard</td>
                  <td className="py-2">NexArt Runtime</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Artnames</td>
                  <td className="py-2 pr-4">Hard</td>
                  <td className="py-2">NexArt Runtime</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Fluids</td>
                  <td className="py-2 pr-4">Not enforced</td>
                  <td className="py-2">—</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Noise</td>
                  <td className="py-2 pr-4">Not enforced</td>
                  <td className="py-2">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Mode Parity</h2>
          
          <p>
            The protocol's goal is that all modes produce canonical units, all modes are versioned, and all modes declare their determinism guarantees. Mode parity—where each mode is a complete and independent way to create NexArt systems—is a protocol goal that implementations are working toward.
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
