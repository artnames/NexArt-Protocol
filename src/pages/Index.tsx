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
        <meta name="description" content="NexArt is an open protocol for generative and sound-driven art systems. A specification for creative computation." />
      </Helmet>
      
      <PageHeader 
        title="NexArt Protocol"
        subtitle="An open protocol for generative and sound-driven art systems."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt is becoming a protocol. Not a product, not a platform, but a shared specification for how generative art systems can be described, stored, and reproduced over time.
          </p>
          
          <p>
            The protocol defines primitives for creative computation: what a system is, what it contains, and how it behaves under different conditions. It establishes a common language for artists, engineers, and tools to work together.
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
            . It is a creative tool for making sound-reactive art. The application is one implementation of the protocol—the first, but not the only.
          </p>
          
          <p>
            This site documents the protocol itself: the rules and structures that define what a NexArt system is, independent of any specific tool or interface.
          </p>

          <h2>Systems, Not Images</h2>
          
          <p>
            Traditional generative art often focuses on outputs: images, videos, files. NexArt focuses on systems—the rules and parameters that produce outputs. An image is a moment; a system is a process.
          </p>
          
          <p>
            By defining systems rather than artifacts, NexArt enables reproducibility, variation, and long-term preservation. A system can be run again, modified, or adapted to new contexts.
          </p>

          <h2>Under Active Development</h2>
          
          <p>
            This protocol is version 0.1. Many details are incomplete. Some concepts are provisional. The specification will evolve as we learn what works and what does not.
          </p>
          
          <p>
            What will not change is the commitment to clarity, openness, and long-term thinking. The protocol is designed to be stable enough to build against, even as it grows.
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
