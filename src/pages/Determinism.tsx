import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Determinism = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Determinism & Versioning - NexArt Protocol</title>
        <meta name="description" content="What NexArt guarantees and what it does not. Reproducibility, best-effort systems, and version stability." />
      </Helmet>
      
      <PageHeader 
        title="Determinism & Versioning"
        subtitle="What NexArt guarantees, and what it does not."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            Reproducibility is central to NexArt. But reproducibility is complicated. This page explains what the protocol guarantees, what it cannot guarantee, and how we handle the gap between ideal and practical.
          </p>

          <h2>What We Guarantee</h2>
          
          <p>
            For systems marked as deterministic, NexArt intends that conforming implementations produce identical visual output given identical inputs. "Identical" means pixel-perfect at the specified resolution, under specified rendering rules.
          </p>
          
          <p>
            This guarantee applies to:
          </p>
          
          <ul>
            <li>Shapes systems with fixed parameters, under standardized rasterization</li>
            <li>Noise systems with specified algorithms and seeds</li>
            <li>Artnames systems with fixed text input and mapping version</li>
            <li>Any system where all inputs are fully specified and the mode supports determinism</li>
          </ul>
          
          <p>
            Pixel-perfect determinism is achievable for conforming implementations that adhere to the specified rendering rules. These rules are being formalized.
          </p>

          <h2>What We Do Not Guarantee</h2>
          
          <p>
            Some systems cannot be perfectly reproduced. The protocol acknowledges this honestly:
          </p>
          
          <p>
            <strong>Floating-point variance.</strong> GPU computations may differ slightly between hardware. A fluid simulation run on two different graphics cards may diverge over time, even with identical initial conditions.
          </p>
          
          <p>
            <strong>Audio analysis differences.</strong> SoundArt systems depend on frequency analysis. Different FFT implementations may produce slightly different values, leading to visual variation.
          </p>
          
          <p>
            <strong>Timing dependencies.</strong> Systems that respond to real-time input (live audio, user interaction) are inherently non-deterministic.
          </p>
          
          <p>
            <strong>Third-party dependencies.</strong> Code Mode systems that rely on external libraries may behave differently if those libraries change.
          </p>

          <h2>Best-Effort Reproducibility</h2>
          
          <p>
            Systems that cannot guarantee perfect determinism are marked as "best-effort." This means: the protocol will try to reproduce the output as closely as possible, but exact replication is not guaranteed.
          </p>
          
          <p>
            Best-effort is not failure. It is an honest acknowledgment of computational reality. Many valuable art systems are best-effort, and the protocol treats them as first-class.
          </p>
          
          <p>
            When a system is best-effort, the protocol may specify tolerance bounds: how much variation is acceptable before the output is considered non-conforming. Tolerance specifications are being developed.
          </p>

          <h2>Versioning</h2>
          
          <p>
            The protocol uses semantic versioning. Each canonical unit records the protocol version it was created against. This version is immutable: once set, it cannot be changed.
          </p>
          
          <p>
            The protocol is committed to long-term support for previous versions. Backward compatibility is the default. Implementations are expected to maintain compatibility with older versions as new features are added.
          </p>

          <h2>Breaking Changes</h2>
          
          <p>
            Breaking changes are avoided. But if one becomes necessary, the protocol handles it as follows:
          </p>
          
          <ul>
            <li>A new major version is released</li>
            <li>Existing systems remain pinned to their original version</li>
            <li>Implementations are expected to support older versions through an explicit deprecation policy</li>
            <li>Migration tools may be provided, but migration is never forced</li>
          </ul>
          
          <p>
            A system created in 2024 should render correctly in 2044. This is the commitment we are working toward.
          </p>

          <h2>Clarity Over Perfection</h2>
          
          <p>
            The NexArt protocol values honesty. We would rather clearly document limitations than pretend they do not exist.
          </p>
          
          <p>
            If a mode cannot guarantee determinism, we say so. If a system is best-effort, we label it. If a guarantee has exceptions, we list them.
          </p>
          
          <p>
            This transparency is essential for trust. Builders who work with NexArt systems need to know what they can rely on. Artists who create systems need to understand how their work will be preserved.
          </p>
          
          <p>
            Perfection is not the goal. Clarity is.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Determinism;
