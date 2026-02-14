import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const Modes = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Modes | Protocol Execution Surfaces"
        description="NexArt modes are protocol surfaces for authoring deterministic generative systems. SoundArt, Code Mode, Shapes, and Noise are protocol-enforced and executed via the Code Mode runtime."
      />

      <PageHeader title="Modes" subtitle="The protocol surfaces of NexArt." />

      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt supports multiple modes. A mode is a protocol surface for authoring a generative system, with defined
            inputs, execution semantics, and determinism guarantees. Protocol-enforced modes are executed through the
            Code Mode runtime and produce canonical units.
          </p>

          <p>
            This page describes each mode at a conceptual level. Implementation details and parameter specifications are
            documented separately.
          </p>

          <h2>SoundArt</h2>

          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol Enforced
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              SoundArt is a protocol-enforced mode executed via the NexArt Code Mode runtime. Audio-reactive systems are
              deterministic, seeded, and verifiable under the NexArt protocol.
            </p>
          </div>

          <p>
            <strong>Intent.</strong> SoundArt enables audio-reactive generative systems. Audio input drives output
            through deterministic parameter mapping.
          </p>

          <p>
            <strong>Inputs.</strong> Audio source normalized into a frozen SoundSnapshot, a seed value, and visual
            generation parameters.
          </p>

          <p>
            <strong>Guarantees.</strong> SoundArt systems execute through the NexArt Code Mode runtime using
            deterministic system generation, seeded randomness, and frozen audio snapshots. No legacy rendering paths
            are permitted for protocol-compliant execution. Outputs are reproducible, verifiable, and protocol-native.
          </p>

          <p>
            <strong>Execution.</strong> Audio features are normalized into a frozen SoundSnapshot, injected into the
            Code Mode runtime as read-only parameters, and rendered using seeded randomness and deterministic noise
            functions. Identical audio input and seed always produce identical output.
          </p>

          <h2>SoundArt Protocol Enforcement</h2>

          <p>
            SoundArt is fully protocol-enforced. Execution routes through the NexArt Code Mode engine exclusively, and
            protocol-compliant flows do not include fallback renderers.
          </p>

          <h3>What Changed</h3>

          <p>
            SoundArt previously operated through custom canvas renderers and legacy pipelines. With protocol
            enforcement, all SoundArt execution uses the Code Mode engine as the single execution path.
          </p>

          <h3>Why It Matters</h3>

          <ul>
            <li>
              <strong>Determinism</strong>, identical audio input and seed produce identical output
            </li>
            <li>
              <strong>Verifiability</strong>, outputs can be independently verified against the protocol
            </li>
            <li>
              <strong>Shared runtime</strong>, SoundArt and Code Mode use the same execution engine
            </li>
          </ul>

          <h3>What This Enables</h3>

          <ul>
            <li>New input types can be added using the same runtime</li>
            <li>Builder SDKs can target a single execution model across modes</li>
            <li>Third-party tools can render SoundArt systems with protocol guarantees</li>
          </ul>

          <h2>Code Mode</h2>

          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                HARD Enforced
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
                Protocol v1.2.0
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Code Mode is a protocol-enforced execution surface under NexArt Protocol v1.2.0. Systems execute
              deterministically within a restricted, standardized runtime.
            </p>
          </div>

          <p>
            <strong>Intent.</strong> Code Mode allows direct specification of execution logic through code, intended for
            builders and advanced users.
          </p>

          <p>
            <strong>Inputs.</strong> A code definition conforming to the protocol specification, along with seed values
            and parameters.
          </p>

          <p>
            <strong>Guarantees.</strong> Code Mode execution is deterministic. The protocol enforces seeded randomness
            and controlled noise functions, and disallows non-deterministic operations. The execution surface is frozen
            under Protocol v1.2.0.
          </p>

          <p>
            <strong>Runtime.</strong> Code Mode is the shared execution environment for protocol-enforced modes.
            SoundArt, Shapes, and Noise execute through the Code Mode runtime.
          </p>

          <h2>Shapes</h2>

          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol Enforced
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Shapes is a protocol-enforced mode executed via the NexArt Code Mode runtime. Parametric geometric systems
              are deterministic, reproducible, and verifiable under the NexArt protocol.
            </p>
          </div>

          <p>
            <strong>Intent.</strong> Shapes provides geometric primitives for composition. Systems are built from
            circles, rectangles, lines, and other basic forms.
          </p>

          <p>
            <strong>Inputs.</strong> A set of shape definitions with position, size, color, and transformation
            parameters.
          </p>

          <p>
            <strong>Guarantees.</strong> Shapes systems are deterministic. The same parameters produce identical output
            across conforming implementations. Rendering is executed through the Code Mode runtime, and
            protocol-compliant flows do not include legacy rendering paths.
          </p>

          <p>
            <strong>Execution.</strong> Shape definitions are processed by the Code Mode runtime using standardized
            primitive definitions and rasterization rules. Outputs are reproducible, verifiable, and protocol-native.
          </p>

          <h2>Noise</h2>

          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Protocol Enforced
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              Noise is a protocol-enforced mode executed via the NexArt Code Mode runtime. Fractal, flow, and cellular
              noise systems are deterministic, reproducible, and verifiable under the NexArt protocol.
            </p>
          </div>

          <p>
            <strong>Intent.</strong> Noise generates textures and patterns using procedural noise functions such as
            Perlin, Simplex, and Worley.
          </p>

          <p>
            <strong>Inputs.</strong> Noise type, frequency, amplitude, octaves, and seed values.
          </p>

          <p>
            <strong>Guarantees.</strong> Noise systems are deterministic. The same algorithm, parameters, and seed
            produce identical output across conforming implementations. Rendering is executed through the Code Mode
            runtime, and protocol-compliant flows do not include legacy rendering paths.
          </p>

          <p>
            <strong>Execution.</strong> Noise parameters are processed by the Code Mode runtime using specified
            algorithms and seeded randomness. Outputs are reproducible, verifiable, and protocol-native.
          </p>

          <h2>Enforcement Status</h2>

          <p>
            These modes are enforced by the NexArt Protocol and executed through the Code Mode runtime. No arbitrary
            rendering logic is permitted in protocol-compliant execution.
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
                  <td className="py-2">Protocol v1.2.0</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Shapes</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      HARD
                    </span>
                  </td>
                  <td className="py-2">Code Mode runtime</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Noise</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      HARD
                    </span>
                  </td>
                  <td className="py-2">Code Mode runtime</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Mode Parity</h2>

          <p>
            The protocol goal is that all modes produce canonical units, all modes are versioned, and all modes declare
            determinism guarantees. Mode parity means each mode is a complete and independent way to author NexArt
            systems. Implementations are working toward this goal.
          </p>

          <p>
            Future modes may be added to the protocol. The framework is designed to accommodate new creation primitives
            without disrupting existing ones.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Modes;
