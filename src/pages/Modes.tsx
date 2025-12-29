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
          
          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol Enforced
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              SoundArt is now a fully protocol-enforced mode, rendered exclusively via the NexArt Code Mode runtime. All audio-reactive artworks are deterministic, seeded, and verifiable under the NexArt protocol.
            </p>
          </div>
          
          <p>
            <strong>Intent.</strong> SoundArt enables audio-reactive generative systems. Audio input drives visual output through deterministic parameter mapping.
          </p>
          
          <p>
            <strong>Inputs.</strong> Audio source (normalized into a frozen SoundSnapshot), seed value, and visual generation parameters.
          </p>
          
          <p>
            <strong>Guarantees.</strong> All SoundArt works are executed through the NexArt Code Mode runtime using deterministic system generation, seeded randomness, and immutable audio snapshots. There are no Canvas2D or legacy rendering paths. Every output is reproducible, verifiable, and protocol-native.
          </p>
          
          <p>
            <strong>Execution.</strong> Audio features are normalized into a frozen SoundSnapshot, injected into the Code Mode runtime as read-only parameters, and rendered using seeded randomness and deterministic noise functions. Identical audio input and seed always produce identical visual output.
          </p>

          <h2>SoundArt Protocol Enforcement (v1)</h2>
          
          <p>
            This section documents a protocol milestone: SoundArt is now fully protocol-enforced.
          </p>
          
          <h3>What Changed</h3>
          
          <p>
            SoundArt previously operated through custom Canvas renderers and legacy pipelines. As of this enforcement milestone, all SoundArt execution routes through the NexArt Code Mode engine exclusively. No fallback renderers or alternative execution paths remain.
          </p>
          
          <h3>Why It Matters</h3>
          
          <ul>
            <li><strong>Determinism</strong> — Audio input produces identical visual output given the same seed, every time</li>
            <li><strong>Verifiability</strong> — Outputs can be independently verified against the protocol</li>
            <li><strong>Shared Runtime</strong> — SoundArt and Code Mode share the same execution engine, ensuring uniform behavior</li>
          </ul>
          
          <h3>What This Enables</h3>
          
          <ul>
            <li>New input types can be added to the protocol using the same runtime</li>
            <li>Builder SDKs can target a single execution model for all modes</li>
            <li>Third-party tools can render SoundArt systems with protocol guarantees</li>
          </ul>

          <h2>Code Mode</h2>
          
          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                HARD Enforced
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
                Protocol v1.0.0
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Code Mode is a protocol-enforced execution surface under NexArt Protocol v1.0.0. Sketches are executed deterministically within a restricted, standardized runtime.
            </p>
          </div>
          
          <p>
            <strong>Intent.</strong> Code Mode allows direct specification of generative logic through code. It provides maximum control for technically sophisticated artists.
          </p>
          
          <p>
            <strong>Inputs.</strong> A code definition conforming to the protocol specification, along with seed values and parameters.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Code Mode execution is deterministic. The protocol enforces deterministic execution through seeded randomness and controlled noise functions. Non-deterministic operations are disallowed. The execution surface is frozen under Protocol v1.0.0.
          </p>
          
          <p>
            <strong>Runtime.</strong> Code Mode is the shared execution environment for all protocol-enforced modes. SoundArt, Shapes, Noise, and Artnames all execute through the Code Mode runtime.
          </p>

          <h2>Shapes</h2>
          
          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol Enforced
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Shapes is a fully protocol-enforced mode, rendered exclusively via the NexArt Code Mode runtime. All parametric geometric systems are deterministic, reproducible, and verifiable under the NexArt protocol.
            </p>
          </div>
          
          <p>
            <strong>Intent.</strong> Shapes provides geometric primitives for visual composition. Systems are built from circles, rectangles, lines, and other basic forms.
          </p>
          
          <p>
            <strong>Inputs.</strong> A set of shape definitions with position, size, color, and transformation parameters.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Shapes systems are fully deterministic. The same parameters produce identical output across conforming implementations. All rendering is executed through the NexArt Code Mode runtime with no Canvas2D or legacy rendering paths.
          </p>
          
          <p>
            <strong>Execution.</strong> Shape definitions are processed by the Code Mode runtime using standardized primitive definitions and rasterization rules. Every output is reproducible, verifiable, and protocol-native.
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
          
          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol Enforced
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Noise is a fully protocol-enforced mode, rendered exclusively via the NexArt Code Mode runtime. All fractal, flow, and cellular noise systems are deterministic, reproducible, and verifiable under the NexArt protocol.
            </p>
          </div>
          
          <p>
            <strong>Intent.</strong> Noise generates textures and patterns using procedural noise functions: Perlin, Simplex, Worley, and others.
          </p>
          
          <p>
            <strong>Inputs.</strong> Noise type, frequency, amplitude, octaves, and seed values.
          </p>
          
          <p>
            <strong>Guarantees.</strong> Noise systems are fully deterministic. The same algorithm, parameters, and seed produce identical output across conforming implementations. All rendering is executed through the NexArt Code Mode runtime with no Canvas2D or legacy rendering paths.
          </p>
          
          <p>
            <strong>Execution.</strong> Noise parameters are processed by the Code Mode runtime using specified algorithms and seeded randomness. Every output is reproducible, verifiable, and protocol-native.
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
          
          <p>
            These modes are enforced by the NexArt Protocol and executed exclusively through the Code Mode runtime. No arbitrary rendering logic is permitted.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium">Mode</th>
                  <th className="text-left py-2 pr-4 font-medium">Enforcement</th>
                  <th className="text-left py-2 font-medium">Execution</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Shapes</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      HARD
                    </span>
                  </td>
                  <td className="py-2">Code Mode runtime</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Noise</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      HARD
                    </span>
                  </td>
                  <td className="py-2">Code Mode runtime</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">SoundArt</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      HARD
                    </span>
                  </td>
                  <td className="py-2">Code Mode runtime</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Code Mode</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      HARD
                    </span>
                  </td>
                  <td className="py-2">Protocol v1.0.0</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Artnames</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      HARD
                    </span>
                  </td>
                  <td className="py-2">Code Mode runtime</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Fluids</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      Not enforced
                    </span>
                  </td>
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
