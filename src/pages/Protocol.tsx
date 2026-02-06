import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";

const Protocol = () => {
  return (
    <PageLayout>
      <SEOHead 
        title="Protocol — Deterministic Execution Standard"
        description="NexArt Protocol defines a canonical execution layer for deterministic generative systems. Verifiable, reproducible, and open to third-party builders."
      />
      
      <PageHeader 
        title="NexArt Protocol"
        subtitle="A canonical execution standard for deterministic generative systems."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            NexArt is both a creative application and a deterministic execution protocol. This page explains what the protocol is, why it exists, and how it enables verifiable, permanent generative systems across art, simulations, and research.
          </p>

          <section className="mt-12">
            <h2>What Is the NexArt Protocol</h2>
            
            <p>
              The NexArt Protocol is a specification for creating, executing, and verifying deterministic generative systems. It defines how generative code should be structured, what execution guarantees it provides, and how outputs can be independently verified.
            </p>
            
            <p>
              Unlike traditional generative art tools, NexArt separates the <em>system</em> (the generative rules) from the <em>output</em> (the rendered image or animation). This separation enables:
            </p>
            
            <ul>
              <li><strong>Reproducibility</strong> — The same system always produces the same output</li>
              <li><strong>Verification</strong> — Any party can re-execute and confirm authenticity</li>
              <li><strong>Permanence</strong> — Systems remain executable across time and platforms</li>
              <li><strong>Interoperability</strong> — Third-party apps can implement the protocol</li>
            </ul>
            
            <p>
              The protocol defines execution semantics, not artistic style or aesthetics.
            </p>
          </section>

          <section className="mt-12">
            <h2>What Is Code Mode</h2>
            
            <p>
              Code Mode is defined exclusively by the <code className="text-caption">@nexart/codemode-sdk</code>, which is the single source of truth for deterministic execution semantics. It is a restricted, deterministic runtime—similar to p5.js in syntax, but constrained to ensure reproducibility.
            </p>
            
            <p>
              Code Mode enforces:
            </p>
            
            <ul>
              <li><strong>Seeded randomness</strong> — All random values derive from a deterministic seed</li>
              <li><strong>No external dependencies</strong> — No network calls, no filesystem access</li>
              <li><strong>Fixed execution environment</strong> — Canvas size, frame rate, and timing are standardized</li>
              <li><strong>Restricted API surface</strong> — Only protocol-approved functions are available</li>
            </ul>
            
            <p>
              This makes Code Mode suitable for NFT minting, long-term archival, simulations, and independent verification.
            </p>

            <p className="text-caption text-sm">
              Protocol versions define guarantees; runtime versions are implementations that adhere to those guarantees. SDK v1.8.4 supports optional passive builder identity via manifest registration, without affecting execution or determinism.
            </p>
          </section>

          <section className="mt-12">
            <h2>Why Determinism Matters</h2>
            
            <p>
              For generative systems to be trustworthy, they must be verifiable. Whether for art collectors, financial auditors, or research peers, there must be assurance that the output will be the same tomorrow, next year, and decades from now.
            </p>
            
            <p>
              Determinism provides this guarantee. When a NexArt system is certified:
            </p>
            
            <ul>
              <li>The generative code is stored permanently</li>
              <li>The seed and parameters are recorded</li>
              <li>Anyone can re-execute the system and verify the output</li>
              <li>The output hash confirms authenticity</li>
            </ul>
            
            <p>
              Any deviation in execution, environment, or semantics will produce a different hash and fail verification.
            </p>
            
            <p>
              This is fundamentally different from storing a rendered image. The artwork exists as executable logic, not just pixels.
            </p>
          </section>

          <section className="mt-12">
            <h2>The Canonical Renderer</h2>
            
            <p>
              The Canonical Renderer is the authoritative execution environment for NexArt systems. It is a Node.js-based runtime that produces cryptographically verified outputs suitable for certification, archival, and verification workflows.
            </p>
            
            <p>
              When a system is certified through a protocol-compliant application:
            </p>
            
            <ol>
              <li>The system code and parameters are submitted to the Canonical Renderer</li>
              <li>The renderer executes the code in a controlled environment</li>
              <li>The output (PNG or MP4) is generated</li>
              <li>A cryptographic hash of the output is recorded</li>
              <li>This hash becomes the permanent proof of authenticity</li>
            </ol>
            
            <p>
              Any party can later re-execute the same system using a protocol-compliant renderer and compare hashes. If they match, the output is verified as authentic.
            </p>
          </section>

          <section className="mt-12">
            <h2>Protocol Architecture</h2>
            
            <h3 className="text-sm font-mono text-caption mt-6 mb-4 tracking-wide uppercase">Authority Chain</h3>
            
            <div className="space-y-6">
              <div className="border border-border p-6 rounded-sm">
                <h3 className="text-base font-medium text-foreground mb-3">Code Mode SDK</h3>
                <p className="text-caption text-sm mb-2">
                  The language definition and execution primitives.
                </p>
                <p className="text-caption text-sm">
                  Defines what Code Mode <em>is</em> — the syntax, available functions, and execution rules.
                </p>
              </div>
              
              <div className="border border-border p-6 rounded-sm">
                <h3 className="text-base font-medium text-foreground mb-3">Canonical Renderer</h3>
                <p className="text-caption text-sm mb-2">
                  The authoritative execution environment for certification and verification.
                </p>
                <p className="text-caption text-sm">
                  Produces verified outputs with cryptographic proofs. Required for minting, audits, and archival.
                </p>
              </div>
              
              <div className="border border-border p-6 rounded-sm">
                <h3 className="text-base font-medium text-foreground mb-3">Protocol-Compliant Apps</h3>
                <p className="text-caption text-sm mb-2">
                  Applications that implement the protocol correctly. Protocol-compliant apps must not alter execution semantics or introduce fallback rendering paths.
                </p>
                <p className="text-caption text-sm">
                  Can create, preview, and certify NexArt systems using the SDK and Canonical Renderer.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2>What This Means</h2>
            
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-base font-medium text-foreground">For Artists</h3>
                <p className="text-caption">
                  Your generative systems are permanent and verifiable. The code you write is the artwork—not just the output it produces. Your work can be independently verified and will remain executable indefinitely.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-foreground">For Developers</h3>
                <p className="text-caption">
                  You can build applications that create and mint NexArt systems. The protocol is open, and compliance is achievable by integrating the SDK and Canonical Renderer.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-foreground">For Collectors</h3>
                <p className="text-caption">
                  You can trust that the artwork you collect is authentic and permanent. The cryptographic hash proves the output matches the original system, and anyone can verify this independently.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-caption">
              For details on protocol compliance levels and third-party integration, see{" "}
              <Link to="/protocol-compliance" className="text-body underline underline-offset-2 hover:text-foreground">
                Protocol Compliance
              </Link>.
            </p>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Protocol;
