import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const CERRetentionPolicy = () => {
  return (
    <PageLayout>
      <SEOHead
        title="CER Retention Policy"
        description="Retention policy for Certified Execution Records (CERs) processed through NexArt-operated infrastructure."
      />

      <PageHeader
        title="Certified Execution Record (CER) Retention Policy"
      />

      <PageContent>
        <div className="prose-protocol">

          <h2>1. Scope</h2>
          <p>
            This policy describes how NexArt retains Certified Execution Records (CERs) generated or stored by NexArt-operated services.
          </p>
          <p>
            This policy applies only to CERs processed through NexArt-hosted infrastructure.
            It does not apply to CERs generated and stored solely by third parties using the open-source SDK.
          </p>

          <h2>2. What Is Retained</h2>
          <p>NexArt-operated services may retain:</p>
          <ul>
            <li>CER bundles (<code>cer.ai.execution.v1</code>)</li>
            <li>Associated attestation receipts</li>
            <li>Minimal operational metadata required for system integrity and billing</li>
          </ul>
          <p>
            CER bundles are stored in secure cloud infrastructure operated by or on behalf of NexArt.
          </p>
          <p>
            No raw model prompts or outputs are retained unless explicitly included within a CER bundle by the caller.
          </p>

          <h2>3. Retention Period</h2>
          <p>
            CER bundles and associated receipts are retained for a minimum period of 90 days, unless:
          </p>
          <ul>
            <li>A longer retention period is contractually required</li>
            <li>A user explicitly deletes their artifacts</li>
            <li>Retention is extended for fraud investigation, abuse prevention, or legal compliance</li>
          </ul>
          <p>
            NexArt does not guarantee indefinite hosting of CER bundles beyond the applicable retention period.
          </p>
          <p>
            Exported CER JSON files remain independently verifiable offline indefinitely using the public SDK.
          </p>

          <h2>4. Portability</h2>
          <p>CER bundles are portable JSON artifacts.</p>
          <p>
            Users may export CERs at any time.
            Exported artifacts remain verifiable offline without requiring access to NexArt infrastructure.
          </p>
          <p>
            Deletion of a CER from NexArt systems does not affect the verifiability of previously exported artifacts.
          </p>

          <h2>5. Integrity Guarantees</h2>
          <p>Once sealed, CER bundles are treated as immutable records.</p>
          <p>
            NexArt does not modify snapshot content, certificateHash values, or attestation receipts after issuance.
          </p>
          <p>If redaction is required, a new sealed record must be created.</p>

          <h2>6. Deletion</h2>
          <p>Users may request deletion of stored CERs, subject to:</p>
          <ul>
            <li>Contractual obligations</li>
            <li>Legal requirements</li>
            <li>Fraud prevention or abuse investigation needs</li>
          </ul>
          <p>
            Deletion removes NexArt-hosted copies only.
            It does not affect user-exported copies.
          </p>

          <h2>7. Policy Updates</h2>
          <p>
            NexArt may update this policy from time to time.
            Material changes will be reflected by updating the "Last Updated" date below.
          </p>

          <p className="text-sm text-muted-foreground mt-12">
            <strong>Last Updated:</strong> 1 March 2026
          </p>
          <p className="text-xs text-muted-foreground mt-6 italic">
            This policy describes NexArt's operational practices and does not constitute a contractual guarantee unless expressly incorporated into a written agreement.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CERRetentionPolicy;
