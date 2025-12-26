import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Builders = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Builders - NexArt Protocol</title>
        <meta name="description" content="Build generative systems on top of the NexArt protocol. Official SDKs, documentation, and resources for developers and artists." />
      </Helmet>
      
      <PageHeader 
        title="Builders"
        subtitle="Build generative systems on top of the NexArt protocol."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt is an open protocol for deterministic generative art.
            It separates system definition, execution, and rendering so artworks remain portable, reproducible, and not tied to a single platform.
          </p>
          
          <p>
            Builders can create tools, mini-apps, renderers, archives, or creative platforms using the official SDKs.
          </p>

          <h2>Who This Is For</h2>
          
          <ul>
            <li>Creative developers building generative art tools</li>
            <li>Artists creating their own platforms or experiments</li>
            <li>AI-native tools that generate visual systems</li>
            <li>Renderer implementers and archivists</li>
            <li>Platform builders integrating generative art into larger products</li>
          </ul>
          
          <p>
            No prior NexArt knowledge is required.
          </p>

          <h2>The Two Official SDKs</h2>

          <h3>@nexart/codemode-sdk — Canonical Runtime</h3>
          
          <p>
            <strong>Purpose:</strong> Archival, deterministic execution<br />
            <strong>Environment:</strong> Node.js (server-side only)
          </p>
          
          <ul>
            <li>Produces canonical PNG / MP4 output</li>
            <li>Same input → same output, forever</li>
            <li>Used by nexart.xyz in production</li>
            <li>Required for minting, publishing, and long-term preservation</li>
          </ul>
          
          <p>
            <strong>Use this when:</strong>
          </p>
          
          <ul>
            <li>You need archival correctness</li>
            <li>You are rendering for minting or storage</li>
            <li>You are building a backend renderer</li>
          </ul>
          
          <pre><code>npm install @nexart/codemode-sdk</code></pre>

          <h3>@nexart/ui-renderer — Browser-First Builder SDK</h3>
          
          <p>
            <strong>Purpose:</strong> Exploration, prototyping, UI tools<br />
            <strong>Environment:</strong> Browser (Canvas, Vite, Lovable, etc.)
          </p>
          
          <ul>
            <li>Declarative system authoring (no raw canvas drawing)</li>
            <li>AI-friendly API with capability discovery</li>
            <li>Lets builders create many visual styles without modifying the engine</li>
            <li>Explicitly non-canonical and non-archival</li>
          </ul>
          
          <p>
            <strong>Use this when:</strong>
          </p>
          
          <ul>
            <li>You are building a web app or mini-app</li>
            <li>You want artists or AI to define systems visually</li>
            <li>You want fast iteration without protocol risk</li>
          </ul>
          
          <pre><code>npm install @nexart/ui-renderer</code></pre>

          <h2>Example (UI Renderer)</h2>
          
          <pre><code>{`import { createSystem, previewSystem } from '@nexart/ui-renderer';

const system = createSystem({
  seed: 29445825,
  background: { color: 'blue', texture: 'noise' },
  elements: [
    { type: 'waves', axis: 'x', amplitude: 0.4, frequency: 0.7 },
    { type: 'dots', distribution: 'radial', count: 400 }
  ],
  motion: { source: 'time', speed: 0.2 }
});

previewSystem(system, canvas, { mode: 'loop' }).start();`}</code></pre>

          <h2>Capability Discovery</h2>
          
          <p>
            The UI SDK exposes its full feature set programmatically so AI tools and builders know exactly what is supported.
          </p>
          
          <pre><code>{`import { getCapabilities } from '@nexart/ui-renderer';
const caps = getCapabilities();`}</code></pre>
          
          <p>
            This returns available primitives, parameter ranges, limits, and metadata.
          </p>

          <h2>Canonical vs Exploratory</h2>
          
          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Canonical</th>
                <th>Exploratory</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>@nexart/codemode-sdk</td>
                <td>✓</td>
                <td>—</td>
              </tr>
              <tr>
                <td>@nexart/ui-renderer</td>
                <td>—</td>
                <td>✓</td>
              </tr>
            </tbody>
          </table>
          
          <p>
            Exploratory tools do not compromise the protocol.
            Canonical execution is always preserved server-side.
          </p>

          <h2>First App Built on the Protocol</h2>
          
          <p>
            The first public app built on the NexArt protocol:{" "}
            <a href="https://builtwithnexartprotocol.xyz/" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">builtwithnexartprotocol.xyz</a>
          </p>

          <h2>Source Code</h2>
          
          <ul>
            <li>
              Canonical SDK: <a href="https://github.com/artnames/nexart-codemode-sdk" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">github.com/artnames/nexart-codemode-sdk</a>
            </li>
            <li>
              UI Renderer SDK: <a href="https://github.com/artnames/nexart-ui-renderer" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">github.com/artnames/nexart-ui-renderer</a>
            </li>
          </ul>

          <h2>Closing</h2>
          
          <p>
            NexArt is designed to be easier to build with than to bypass.
            If you can describe a generative system, you can express it through the protocol.
          </p>
          
          <p>
            Builders and artists are invited to experiment, extend, and build openly.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Builders;
