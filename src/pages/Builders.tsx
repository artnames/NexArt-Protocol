import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const Builders = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Builders | SDKs for Deterministic Execution"
        description="Build on NexArt: deterministic execution semantics, canonical certification, and builder SDKs for verification, archival, and protocol-compliant previews."
      />

      <PageHeader
        title="Builders"
        subtitle="SDKs and reference tooling for deterministic execution and protocol-compliant rendering."
      />

      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt is an open execution protocol for deterministic and integrity-bound systems. It separates system definition, execution
            semantics, and outputs so results remain portable, verifiable, and stable across time and environments.
          </p>

          <p>
            Builders can ship applications, developer tools, archives, marketplaces, and certification pipelines using
            the official SDKs.
          </p>

          <h2>Who This Is For</h2>

          <ul>
            <li>Developers building protocol-compliant creation and preview tools</li>
            <li>Teams integrating deterministic media into larger products</li>
            <li>Renderer implementers, archivists, and verification tooling builders</li>
            <li>AI systems that generate or transform executable visual specifications</li>
            <li>Artists building their own creation surfaces on top of the runtime</li>
          </ul>

          <p>No prior NexArt knowledge is required.</p>

          <h2>The Canonical SDK</h2>

          <h3>@nexart/codemode-sdk v1.9.0</h3>

          <p>
            <strong>Role:</strong> Canonical execution runtime for certification and archival
            <br />
            <strong>Environment:</strong> Node.js (server-side)
            <br />
            <strong>Protocol:</strong> v1.2.0 execution semantics
          </p>

          <ul>
            <li>Produces canonical PNG and MP4 outputs</li>
            <li>Deterministic execution with pinned semantics</li>
            <li>Used by nexart.xyz in production</li>
            <li>Required for certification, minting, and long-term verification</li>
          </ul>

          <p>
            <strong>Use this when:</strong>
          </p>

          <ul>
            <li>You need reproducibility guarantees that hold over time</li>
            <li>You are generating outputs for minting, storage, or audit trails</li>
            <li>You are implementing a renderer or verification pipeline</li>
          </ul>

          <h2>Builder Tooling</h2>

          <h3>@nexart/ui-renderer v0.9.1</h3>

          <p>
            <strong>Role:</strong> Protocol-aligned previews and developer tooling
            <br />
            <strong>Environment:</strong> Browser
          </p>

          <p>
            The UI Renderer mirrors the protocol surface for previews, UX flows, and builder tools. It is designed for
            fast iteration and capability discovery.
          </p>

          <ul>
            <li>Declarative system authoring</li>
            <li>Capability discovery for builders and AI tools</li>
            <li>Rapid prototyping for UI and creation surfaces</li>
          </ul>

          <div className="bg-muted/50 border border-border rounded-md p-4 my-6">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>Important:</strong> The UI Renderer is not the canonical execution environment. Do not use it for
              certification, minting, or archival. Canonical outputs are produced server-side via{" "}
              <code>@nexart/codemode-sdk</code>.
            </p>
          </div>

          <h2>Capability Discovery</h2>

          <p>
            The UI SDK exposes its full supported surface programmatically so tools can reliably understand what is
            available: primitives, parameter ranges, limits, and metadata.
          </p>

          <h2>Canonical and exploratory layers</h2>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-y-3">
              <colgroup>
                <col className="w-[44%]" />
                <col className="w-[28%]" />
                <col className="w-[28%]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="text-left pb-3 pr-6 text-sm font-semibold text-foreground/80">Package</th>
                  <th className="text-left pb-3 pr-6 text-sm font-semibold text-foreground/80">Canonical</th>
                  <th className="text-left pb-3 text-sm font-semibold text-foreground/80">Exploratory</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-muted/20 ring-1 ring-border/60 rounded-md">
                  <td className="py-4 px-4 align-top font-medium text-foreground rounded-l-md">@nexart/codemode-sdk</td>
                  <td className="py-4 px-4 align-top border-l border-border/70 text-foreground/90">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                      Yes
                    </span>
                  </td>
                  <td className="py-4 px-4 align-top border-l border-border/70 text-foreground/80 rounded-r-md">No</td>
                </tr>

                <tr className="bg-muted/20 ring-1 ring-border/60 rounded-md">
                  <td className="py-4 px-4 align-top font-medium text-foreground rounded-l-md">@nexart/ui-renderer</td>
                  <td className="py-4 px-4 align-top border-l border-border/70 text-foreground/80">No</td>
                  <td className="py-4 px-4 align-top border-l border-border/70 text-foreground/90 rounded-r-md">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                      Yes
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Exploratory tooling does not change protocol semantics. Certification and verification are always anchored
            to canonical, server-side execution.
          </p>

          <h2>First app built on the protocol</h2>

          <p>
            The first public app built on the NexArt protocol:{" "}
            <a
              href="https://builtwithnexartprotocol.xyz/"
              className="text-link hover:text-link-hover underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              builtwithnexartprotocol.xyz
            </a>
          </p>

          <h2>Source code</h2>

          <ul>
            <li>
              Canonical SDK:{" "}
              <a
                href="https://github.com/artnames/nexart-codemode-sdk"
                className="text-link hover:text-link-hover underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/artnames/nexart-codemode-sdk
              </a>
            </li>
            <li>
              UI Renderer SDK:{" "}
              <a
                href="https://github.com/artnames/nexart-ui-renderer"
                className="text-link hover:text-link-hover underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/artnames/nexart-ui-renderer
              </a>
            </li>
          </ul>

          <h2>Closing</h2>

          <p>
            NexArt is designed to be easier to build with than to bypass. If you can define a generative system, you can
            express it as a protocol object and certify it under pinned execution semantics.
          </p>

          <p>Builders are invited to experiment, extend, and ship protocol-native tooling.</p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Builders;
