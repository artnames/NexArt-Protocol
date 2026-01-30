import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const ProtocolCompliance = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Protocol Compliance - NexArt Protocol</title>
        <meta name="description" content="What it means to be NexArt Protocol compliant. Compliance levels, requirements, and examples of protocol-compliant applications." />
      </Helmet>
      
      <PageHeader 
        title="Protocol Compliance"
        subtitle="Standards for protocol-compliant applications."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            Third-party applications can implement the NexArt Protocol to create, preview, and certify deterministic generative systems. This page defines what compliance means and the different levels of integration.
          </p>

          <section className="mt-12">
            <h2>What Is Protocol Compliance</h2>
            
            <p>
              A protocol-compliant application correctly implements the NexArt Protocol specification. This means:
            </p>
            
            <ul>
              <li>Code Mode systems execute identically to the reference implementation</li>
              <li>Determinism guarantees are preserved</li>
              <li>Output can be independently verified</li>
              <li>Systems created in one compliant app work in all others</li>
            </ul>
            
            <p>
              Compliance is not about branding or affiliation. It is a technical standard that any application can meet by implementing the protocol correctly.
            </p>
          </section>

          <section className="mt-12">
            <h2>Compliance Levels</h2>
            
            <p>
              There are two levels of protocol compliance, depending on which components an application integrates.
            </p>
            
            <div className="mt-6 space-y-6">
              <div className="border border-border p-6 rounded-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono px-2 py-1 bg-muted text-muted-foreground rounded-sm">LEVEL 1</span>
                  <h3 className="text-base font-medium text-foreground">SDK Integration</h3>
                </div>
                <p className="text-caption text-sm mb-4">
                  The application uses <code className="text-caption">@nexart/codemode-sdk</code> or <code className="text-caption">@nexart/ui-renderer</code> for preview and creation.
                </p>
                <div className="text-sm">
                  <p className="text-foreground font-medium mb-2">Enables:</p>
                  <ul className="text-caption space-y-1 list-disc list-inside">
                    <li>Creating valid Code Mode systems</li>
                    <li>Live preview during creation</li>
                    <li>Exporting system definitions</li>
                    <li>Interoperability with other compliant apps</li>
                  </ul>
                </div>
                <div className="mt-4 text-sm">
                  <p className="text-foreground font-medium mb-2">Limitations:</p>
                  <ul className="text-caption space-y-1 list-disc list-inside">
                    <li>Previews are non-canonical (not suitable for minting)</li>
                    <li>No cryptographic verification of outputs</li>
                    <li>Cannot produce archival-grade renders</li>
                  </ul>
                </div>
              </div>
              
              <div className="border border-border p-6 rounded-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono px-2 py-1 bg-foreground text-background rounded-sm">LEVEL 2</span>
                  <h3 className="text-base font-medium text-foreground">SDK + Canonical Renderer</h3>
                </div>
                <p className="text-caption text-sm mb-4">
                  The application uses the SDK for creation and the Canonical Renderer for final output.
                </p>
                <div className="text-sm">
                  <p className="text-foreground font-medium mb-2">Enables:</p>
                  <ul className="text-caption space-y-1 list-disc list-inside">
                    <li>Everything in Level 1</li>
                    <li>Canonical, archival-grade rendering</li>
                    <li>Cryptographic output verification</li>
                    <li>NFT minting with proof of authenticity</li>
                    <li>Full protocol guarantees</li>
                  </ul>
                </div>
                <div className="mt-4 text-sm">
                  <p className="text-foreground font-medium mb-2">Requirements:</p>
                  <ul className="text-caption space-y-1 list-disc list-inside">
                    <li>Integration with NexArt Canonical Renderer API</li>
                    <li>Proper handling of output hashes</li>
                    <li>Compliance with minting standards</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2>Why Canonical Certification Matters</h2>
            
            <p>
              Level 1 compliance is sufficient for creation and exploration, but Level 2 is required for certification because:
            </p>
            
            <ul>
              <li><strong>Determinism verification</strong> — Only the Canonical Renderer produces outputs that can be independently verified</li>
              <li><strong>Hash permanence</strong> — The output hash becomes the permanent proof of authenticity</li>
              <li><strong>Audit-grade trust</strong> — Any party can verify that the output matches the original system</li>
              <li><strong>Long-term archival</strong> — Canonical outputs are the authoritative record</li>
            </ul>
            
            <p>
              A preview rendered in the browser may look identical, but it lacks the cryptographic proof that makes verification possible.
            </p>
            
            <p className="text-caption text-sm mt-4">
              Minting is one application of certification; the same guarantees apply to simulations, audits, and verification workflows.
            </p>
          </section>

          <section className="mt-12">
            <h2>Protocol-Compliant Applications</h2>
            
            <p>
              The following applications independently implement the NexArt Protocol at different compliance levels. Inclusion reflects technical compliance, not ownership or endorsement.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-border p-6 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-medium text-foreground">NexArt</h3>
                  <span className="text-xs font-mono px-2 py-1 bg-foreground text-background rounded-sm">LEVEL 2</span>
                </div>
                <p className="text-caption text-sm mb-2">
                  Reference application for generative art creation with full SDK and Canonical Renderer integration.
                </p>
                <p className="text-xs text-muted-foreground">
                  <a href="https://nexart.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-caption">
                    nexart.xyz
                  </a>
                </p>
              </div>
              
              <div className="border border-border p-6 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-medium text-foreground">ByX</h3>
                  <span className="text-xs font-mono px-2 py-1 bg-foreground text-background rounded-sm">LEVEL 2</span>
                </div>
                <p className="text-caption text-sm mb-2">
                  Generative collection platform with certified minting.
                </p>
                <p className="text-xs text-muted-foreground">
                  <a href="https://byxcollection.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-caption">
                    byxcollection.xyz
                  </a>
                </p>
              </div>
              
              <div className="border border-border p-6 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-medium text-foreground">Recanon</h3>
                  <span className="text-xs font-mono px-2 py-1 bg-foreground text-background rounded-sm">LEVEL 2</span>
                </div>
                <p className="text-caption text-sm mb-2">
                  Canonical verification and replay client.
                </p>
                <p className="text-xs text-muted-foreground">
                  <a href="https://recanon.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-caption">
                    recanon.xyz
                  </a>
                </p>
              </div>
              
              <div className="border border-border p-6 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-medium text-foreground">NexArt Science Lab</h3>
                  <span className="text-xs font-mono px-2 py-1 bg-foreground text-background rounded-sm">LEVEL 2</span>
                </div>
                <p className="text-caption text-sm mb-2">
                  Deterministic research and simulation environment.
                </p>
                <p className="text-xs text-muted-foreground">
                  <a href="https://nexartsciencelab.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-caption">
                    nexartsciencelab.xyz
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2>Becoming Compliant</h2>
            
            <p>
              If you are building an application that creates or displays NexArt systems, you can achieve compliance by:
            </p>
            
            <ol>
              <li>Integrating the Code Mode SDK for system creation and preview</li>
              <li>Optionally integrating the Canonical Renderer for minting capabilities</li>
              <li>Following the protocol specification for system structure and metadata</li>
              <li>Preserving determinism guarantees in your implementation</li>
            </ol>
            
            <p>
              There is no certification process. Compliance is self-declared and verifiable—if your outputs match the Canonical Renderer's outputs, you are compliant.
            </p>
          </section>

          <section className="mt-12" id="acceptance-checklist">
            <h2>Acceptance Checklist</h2>
            
            <p>
              The canonical renderer adheres to the following behavior guarantees. Compliant clients and integrations should expect these behaviors.
            </p>
            
            <div className="spec-table-wrapper mt-6">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Behavior</th>
                    <th>Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>C1</code></td>
                    <td>Valid request with all fields</td>
                    <td><code>200</code>, <code>image/png</code></td>
                  </tr>
                  <tr>
                    <td><code>C2</code></td>
                    <td>Same inputs produce same output</td>
                    <td>Identical <code>outputHash</code></td>
                  </tr>
                  <tr>
                    <td><code>C3</code></td>
                    <td>Missing API key</td>
                    <td><code>401</code></td>
                  </tr>
                  <tr>
                    <td><code>C4</code></td>
                    <td>Invalid API key</td>
                    <td><code>401</code></td>
                  </tr>
                  <tr>
                    <td><code>C5</code></td>
                    <td>Account quota exceeded (distinct from rate limiting)</td>
                    <td><code>429</code></td>
                  </tr>
                  <tr>
                    <td><code>C6</code></td>
                    <td>Protocol violation (e.g., wrong canvas size)</td>
                    <td><code>400</code></td>
                  </tr>
                  <tr>
                    <td><code>C7</code></td>
                    <td>Rate limit exceeded</td>
                    <td><code>429</code></td>
                  </tr>
                  <tr>
                    <td><code>C8</code></td>
                    <td>Response includes runtime hash</td>
                    <td><code>x-runtime-hash</code> header present</td>
                  </tr>
                  <tr>
                    <td><code>C9</code></td>
                    <td>Response includes protocol version</td>
                    <td><code>x-protocol-version</code> header present</td>
                  </tr>
                  <tr>
                    <td><code>C10</code></td>
                    <td>Missing <code>protocolVersion</code> in request</td>
                    <td><code>200</code>, <code>image/png</code>, <code>x-protocol-version</code> present, <code>x-protocol-defaulted: true</code>, snapshot records resolved version</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-caption text-sm mt-4">
              C10 confirms that <code>protocolVersion</code> is lenient (optional) but always resolved and recorded. The canonical renderer defaults to its current version when omitted. C5 and C7 both return <code>429</code>; quota enforcement (C5) is account-level and distinct from rate limiting (C7).
            </p>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-caption mb-4">
              Certified runs are subject to account-level plan limits. Quotas apply per account across all API keys. See{" "}
              <a href="/pricing" className="text-body underline underline-offset-2 hover:text-foreground">
                pricing
              </a>{" "}
              for details.
            </p>
            <p className="text-caption mb-4">
              For details on execution isolation, sandboxing, and audit guarantees, see{" "}
              <a href="/security" className="text-body underline underline-offset-2 hover:text-foreground">
                Security Architecture
              </a>.
            </p>
            <p className="text-caption">
              For technical details on SDK integration, see the{" "}
              <a href="/builders" className="text-body underline underline-offset-2 hover:text-foreground">
                Builders
              </a>{" "}
              page.
            </p>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default ProtocolCompliance;