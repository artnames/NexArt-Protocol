import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const Privacy = () => {
  return (
    <PageLayout>
      <SEOHead 
        title="Privacy Policy"
        description="Privacy Policy for NexArt Protocol & Dashboard. Learn how we collect, use, and protect your data."
      />
      
      <PageHeader 
        title="Privacy Policy"
        subtitle="NexArt Protocol & Dashboard"
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p className="text-sm text-muted-foreground mb-8">
            <strong>Effective date:</strong> 28 January 2026
          </p>

          <p>
            NexArt provides a developer dashboard and API access to certified execution services — including deterministic rendering (Code Mode) and tamper-evident AI execution records (Certified Execution Records / CER) with optional independent attestation ("Certification Services").
          </p>

          <h2>What we collect</h2>
          
          <ul>
            <li><strong>Account data:</strong> email address and authentication identifiers (including Google OAuth, if used).</li>
            <li><strong>Usage data:</strong> API key usage metrics (counts, timestamps, success/error codes, and request duration).</li>
            <li><strong>CER metadata:</strong> certificate hashes, bundle types, attestation timestamps, and redacted record summaries. Full CER content (inputs, outputs, prompts) is client-retained and not stored by NexArt unless explicitly submitted for attestation.</li>
            <li><strong>Technical data:</strong> IP address and basic request logs for security and abuse prevention.</li>
          </ul>

          <h2>Why we collect it</h2>
          
          <ul>
            <li>To create and secure your account.</li>
            <li>To provide Certification Services, enforce quotas, and prevent abuse.</li>
            <li>To maintain service reliability and investigate incidents.</li>
            <li>To communicate service updates and support requests.</li>
          </ul>

          <h2>Where data is processed</h2>
          
          <ul>
            <li>Authentication is handled by Supabase Auth.</li>
            <li>Usage and API key metadata are stored in our Postgres database (hosted on Railway).</li>
            <li>Our infrastructure providers may process limited technical logs necessary to operate the service.</li>
          </ul>

          <h2>Sharing</h2>
          
          <p>
            We share data only with service providers that help us operate NexArt (e.g., Supabase, Railway, hosting providers). We do not sell personal data.
          </p>

          <h3>Payments</h3>
          
          <p>
            Payment processing is handled by Stripe. Stripe may process personal and transactional data in accordance with its own privacy policy. NexArt does not store full payment card details.
          </p>

          <h2>Retention</h2>
          
          <p>
            We retain account and usage data for as long as your account is active, and for a reasonable period afterward for security, audit, and dispute resolution.
          </p>

          <h2>Redaction and Verification</h2>

          <p>
            CER records support field-level redaction. Sensitive fields (such as inputs, outputs, or prompts) can be removed or set to null. Redaction produces a new, valid certificateHash for the redacted version of the record. The original hash is preserved in provenance metadata for audit traceability. Verification confirms record integrity — it does not re-run models or validate output correctness.
          </p>

          <h2>Your rights</h2>
          
          <p>
            You may request access, correction, or deletion of your account data by emailing: <a href="mailto:support@nexart.io" className="text-link hover:text-link-hover underline underline-offset-2">support@nexart.io</a>
          </p>

          <h2>Security</h2>
          
          <p>
            We use reasonable technical and organizational measures to protect data. No method of transmission or storage is 100% secure.
          </p>

          <h2>Execution Data & Privacy</h2>

          <p>
            For detailed information on how NexArt handles execution data, cryptographic hashes, public verification records,
            and the responsibilities of integrating applications, see{" "}
            <a href="/compliance/privacy-data-handling" className="text-link hover:text-link-hover underline underline-offset-2">Privacy & Data Handling</a>.
          </p>

          <h2>Contact</h2>
          
          <p>
            Email: <a href="mailto:contact@artnames.io" className="text-link hover:text-link-hover underline underline-offset-2">contact@artnames.io</a>
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Privacy;
