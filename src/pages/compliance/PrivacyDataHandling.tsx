import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const PrivacyDataHandling = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Privacy & Data Handling"
        description="How NexArt handles execution data, what is stored, what is not, and who is responsible for personal data in certified execution records."
      />

      <PageHeader
        title="Privacy & Data Handling"
        subtitle="Execution integrity infrastructure — data responsibilities and transparency"
      />

      <PageContent>
        <div className="prose-protocol">

          {/* On this page */}
          <nav className="mb-12 p-4 border border-border rounded-md bg-muted/30">
            <p className="text-xs font-mono text-caption mb-3 tracking-wide">On this page</p>
            <ul className="space-y-1.5 text-sm list-none pl-0">
              <li><a href="#execution-data" className="text-link hover:text-link-hover underline-offset-2">1. Execution Data & Privacy</a></li>
              <li><a href="#public-verification" className="text-link hover:text-link-hover underline-offset-2">2. Public Verification Records</a></li>
              <li><a href="#integrator-responsibility" className="text-link hover:text-link-hover underline-offset-2">3. Responsibility of Integrating Applications</a></li>
              <li><a href="#nexart-role" className="text-link hover:text-link-hover underline-offset-2">4. NexArt's Role</a></li>
              <li><a href="#operational-logs" className="text-link hover:text-link-hover underline-offset-2">5. Operational Logs</a></li>
            </ul>
          </nav>

          {/* Section 1 */}
          <h2 id="execution-data">1. Execution Data & Privacy</h2>
          <p>
            NexArt stores <strong>execution integrity metadata</strong> rather than raw application data.
          </p>
          <p>
            A Certified Execution Record (CER) typically contains:
          </p>
          <ul>
            <li>Certificate hash</li>
            <li>Execution identifier</li>
            <li>Input and output hashes</li>
            <li>Protocol version and runtime metadata</li>
            <li>Node attestation data</li>
            <li>Timestamps</li>
          </ul>
          <p>
            NexArt stores <strong>cryptographic hashes</strong> of inputs and outputs — not the underlying payloads themselves.
            Hashes are one-way derivations used to bind execution results to a certification record without requiring
            the platform to store, process, or have access to the underlying data.
          </p>
          <p>
            Raw AI prompts, model outputs, rendered artifacts, and user-supplied payloads are <strong>not stored by NexArt</strong> unless
            explicitly included in a CER bundle by the integrating application.
          </p>

          {/* Section 2 */}
          <h2 id="public-verification">2. Public Verification Records</h2>
          <p>
            NexArt provides a public verification endpoint that allows anyone to independently verify
            the integrity of a Certified Execution Record using a certificate hash or execution ID.
          </p>
          <p>
            Public verification records are <strong>redacted</strong>. Sensitive execution payloads — such as
            inputs, outputs, prompts, and application-specific data — are not included in the public response.
          </p>
          <p>
            The verifier exposes only the information required to independently confirm record integrity:
          </p>
          <ul>
            <li>Certificate hash</li>
            <li>Execution ID</li>
            <li>Protocol version</li>
            <li>Node attestation</li>
            <li>Runtime hash</li>
            <li>Metadata fields provided by the application (e.g., bundle type, project name)</li>
          </ul>
          <p>
            This design ensures that verification can occur without exposing the execution content
            that produced the record.
          </p>

          {/* Section 3 */}
          <h2 id="integrator-responsibility">3. Responsibility of Integrating Applications</h2>
          <p>
            Applications integrating NexArt are responsible for the data they submit to the certification API.
          </p>
          <p>
            Developers should avoid including personal identifiers in fields such as:
          </p>
          <ul>
            <li><code>executionId</code></li>
            <li><code>metadata</code></li>
            <li><code>projectId</code></li>
            <li><code>appId</code></li>
          </ul>
          <p>
            These fields may appear in certification records and, where applicable, in public verification responses.
            Using internal or opaque identifiers is strongly recommended.
          </p>

          <div className="my-6 p-4 border border-border rounded-md bg-muted/20 font-mono text-sm">
            <p className="text-caption mb-2">Preferred:</p>
            <p className="text-foreground mb-4"><code>executionId = "tx_8347293"</code></p>
            <p className="text-caption mb-2">Avoid:</p>
            <p className="text-foreground"><code>executionId = "john-smith-payment"</code></p>
          </div>

          <p>
            If personal data is included in submitted fields, the integrating application — not NexArt — is the
            data controller for that information under applicable privacy regulations.
          </p>

          {/* Section 4 */}
          <h2 id="nexart-role">4. NexArt's Role</h2>
          <p>
            NexArt operates as an <strong>execution integrity infrastructure provider</strong>. Its role is limited to:
          </p>
          <ul>
            <li>Generating Certified Execution Records</li>
            <li>Cryptographically binding execution metadata to certification artifacts</li>
            <li>Providing node attestations for sealed records</li>
            <li>Enabling independent verification of records</li>
          </ul>
          <p>
            NexArt does not process or store the underlying user data that produced an execution unless
            that data is explicitly included in a CER bundle by the integrating application.
          </p>
          <p>
            Where NexArt acts solely as a processor of cryptographic metadata on behalf of an integrating application,
            the integrating application remains the data controller for any personal data submitted to the API.
          </p>

          {/* Section 5 */}
          <h2 id="operational-logs">5. Operational Logs</h2>
          <p>
            NexArt may retain limited operational logs for service reliability, security monitoring, and abuse prevention.
          </p>
          <p>
            These logs may include request metadata such as IP addresses, timestamps, and API key identifiers.
            Logs are retained for a limited period and do not include raw execution payloads, AI prompts, or model outputs.
          </p>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              For account-level privacy information, see the{" "}
              <a href="/privacy" className="text-link hover:text-link-hover underline underline-offset-2">Privacy Policy</a>.
              For record retention details, see the{" "}
              <a href="/legal/cer-retention-policy" className="text-link hover:text-link-hover underline underline-offset-2">CER Retention Policy</a>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Questions: <a href="mailto:support@nexart.io" className="text-link hover:text-link-hover underline underline-offset-2">support@nexart.io</a>
            </p>
            <p className="text-xs text-muted-foreground mt-6 italic">
              Last updated: 8 March 2026
            </p>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default PrivacyDataHandling;
