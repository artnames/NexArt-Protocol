import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>NexArt Protocol - An Open Creative Protocol</title>
        <meta name="description" content="NexArt is evolving into an open protocol for generative and sound-driven art systems. A specification for creative computation." />
      </Helmet>
      
      <PageHeader 
        title="NexArt Protocol"
        subtitle="Evolving toward an open protocol for generative and sound-driven art systems."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt is evolving from a single creative app into an open protocol. Not a product, not a platform, but a shared specification for how generative art systems can be described, stored, and reproduced over time.
          </p>
          
          <p>
            The protocol intends to define primitives for creative computation: what a system is, what it contains, and how it behaves under different conditions. It aims to establish a common language for artists, engineers, and tools to work together.
          </p>

          <h2>Two Things Called NexArt</h2>
          
          <p>
            There is an application at{" "}
            <a 
              href="https://nexart.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-link hover:text-link-hover underline underline-offset-2"
            >
              nexart.xyz
            </a>
            . It is the current primary tool for making generative and sound-driven art. The application is being migrated toward full protocol conformance—it is the first implementation, but not the only one the protocol intends to support.
          </p>
          
          <p>
            This site documents the protocol itself: the rules and structures that will define what a NexArt system is, independent of any specific tool or interface.
          </p>

          <h2>Systems, Not Images</h2>
          
          <p>
            Traditional generative art often focuses on outputs: images, videos, files. NexArt focuses on systems—the rules and parameters that produce outputs. An image is a moment; a system is a process.
          </p>
          
          <p>
            By defining systems rather than artifacts, NexArt enables reproducibility, variation, and long-term preservation. A system can be run again, modified, or adapted to new contexts. Current implementations often store rendered outputs alongside metadata; the protocol's goal is for system definitions to be sufficient for reproduction.
          </p>

          <h2>Specification Status</h2>
          
          <p>
            <strong>Current Protocol Version: v0.4</strong>
          </p>
          
          <p>
            The NexArt Protocol is actively enforced in production. Code Mode, SoundArt, Shapes, and Artnames are all hard-enforced and execute through the shared NexArt runtime.
          </p>
          
          <div className="bg-primary/10 border border-primary/30 rounded-md p-4 my-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Milestone
              </span>
              <span className="text-sm font-medium">SoundArt Protocol Enforcement (v1)</span>
            </div>
            <p className="text-sm text-muted-foreground mb-0">
              SoundArt is now fully protocol-enforced. All audio-reactive artworks are deterministic, seeded, and verifiable—rendered exclusively via the NexArt Code Mode runtime with no legacy rendering paths.
            </p>
          </div>
          
          <p>
            What will not change is the commitment to clarity, openness, and long-term thinking. The protocol is designed to be stable enough to study against, even as it grows.
          </p>

          <h2>Where to Begin</h2>
          
          <ul>
            <li>
              <Link to="/protocol" className="text-link hover:text-link-hover underline underline-offset-2">
                Protocol Overview
              </Link>
              {" "}— The conceptual foundation
            </li>
            <li>
              <Link to="/canonical-unit" className="text-link hover:text-link-hover underline underline-offset-2">
                Canonical Unit
              </Link>
              {" "}— The core protocol object
            </li>
            <li>
              <Link to="/modes" className="text-link hover:text-link-hover underline underline-offset-2">
                Modes
              </Link>
              {" "}— The creation primitives
            </li>
            <li>
              <Link to="/builders" className="text-link hover:text-link-hover underline underline-offset-2">
                Builders
              </Link>
              {" "}— For those who want to contribute
            </li>
          </ul>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Index;
