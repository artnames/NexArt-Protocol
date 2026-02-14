import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const Determinism = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Determinism and Versioning | Protocol Guarantees"
        description="NexArt defines deterministic execution and versioned guarantees for generative systems. Learn what is guaranteed, what is out of scope, and how best-effort systems are handled."
      />

      <PageHeader title="Determinism and Versioning" subtitle="What NexArt guarantees, and what it does not." />

      <PageContent>
        <div className="prose-protocol">
          <p>
            Reproducibility is central to NexArt, but it only matters if guarantees are explicit. This page describes
            what the protocol guarantees, what is outside those guarantees, and how versioning keeps execution stable
            over time.
          </p>

          <h2>What We Guarantee</h2>

          <p>
            For systems marked deterministic, the protocol requires conforming implementations to produce identical
            output given identical inputs. Identical means pixel-perfect at the specified resolution under the
            protocol’s rendering rules.
          </p>

          <p>
            Certified runs are produced by the Canonical Renderer, which serves as the reference implementation for
            verification-grade output.
          </p>

          <p>The following modes are protocol-enforced under the NexArt Protocol:</p>

          <ul>
            <li>
              <strong>Shapes</strong>, parametric geometric systems executed via the Code Mode runtime
            </li>
            <li>
              <strong>Noise</strong>, fractal, flow, and cellular noise systems executed via the Code Mode runtime
            </li>
            <li>
              <strong>SoundArt</strong>, audio-reactive systems with frozen audio snapshots executed via the Code Mode
              runtime
            </li>
            <li>
              <strong>Code Mode</strong>, deterministic systems under Protocol v1.2.0
            </li>
          </ul>

          <p>
            These modes are enforced by the NexArt Protocol and executed through the Code Mode runtime.
            Protocol-compliant execution does not include Canvas2D, legacy, or fallback rendering paths.
          </p>

          <h2>What We Do Not Guarantee</h2>

          <p>Some systems cannot be perfectly reproduced. The protocol documents these limits explicitly.</p>

          <p>
            <strong>Non-canonical environments.</strong> Floating-point behavior can vary across hardware and runtimes.
            Certification-grade output is produced by the Canonical Renderer to avoid hardware-specific drift.
          </p>

          <p>
            <strong>Real-time inputs.</strong> Systems that depend on user interaction, wall-clock time, or live data
            are outside deterministic guarantees unless the inputs are captured as immutable snapshots inside the
            canonical unit.
          </p>

          <p>
            <strong>Out-of-protocol code.</strong> Protocol-enforced modes disallow external dependencies. If an
            implementation executes non-protocol code or dynamic imports, results are non-conforming and not covered by
            protocol guarantees.
          </p>

          <h2>Best-Effort Reproducibility</h2>

          <p>
            Systems that cannot guarantee perfect determinism are marked best-effort. The protocol will reproduce output
            as closely as possible, but exact replication is not guaranteed.
          </p>

          <p>
            Best-effort is not failure. It is an explicit acknowledgment of computational reality, and the protocol
            treats best-effort systems as first-class.
          </p>

          <p>
            Best-effort systems may later include tolerance bounds that define acceptable variation before an output is
            considered non-conforming. Tolerance specifications are being developed.
          </p>

          <h2>Versioning</h2>

          <p>
            The protocol uses semantic versioning. Each canonical unit records the protocol version it was created
            against. This version is immutable once set.
          </p>

          <p className="text-caption text-sm">
            Protocol versions define guarantees. Runtime versions are implementations that adhere to those guarantees.
          </p>

          <p>
            Each replay must use the same versioned execution semantics as the original system. Backward compatibility
            is the default, and implementations are expected to maintain support for older versions as new features are
            added.
          </p>

          <h2>Breaking Changes</h2>

          <p>Breaking changes are avoided. If one becomes necessary, the protocol handles it as follows:</p>

          <ul>
            <li>A new major version is released</li>
            <li>Existing systems remain pinned to their original version</li>
            <li>Implementations support older versions through an explicit deprecation policy</li>
            <li>Migration tools may be provided, but migration is never forced</li>
          </ul>

          <p>
            A system created in 2024 should render correctly in 2044. This is the commitment the protocol is designed to
            support.
          </p>

          <h2>Clarity Over Perfection</h2>

          <p>The NexArt protocol values explicit guarantees. Limitations are documented instead of hidden.</p>

          <p>
            If a mode cannot guarantee determinism, it is stated. If a system is best-effort, it is labeled. If a
            guarantee has exceptions, they are listed.
          </p>

          <p>
            This transparency is essential for trust. Builders need to know what they can rely on. Creators need to know
            how systems will be preserved and verified.
          </p>

          <p>Perfection is not the goal. Clarity is.</p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Determinism;
