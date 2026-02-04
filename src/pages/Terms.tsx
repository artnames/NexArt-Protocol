import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Terms = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Terms of Service - NexArt Protocol</title>
        <meta name="description" content="Terms of Service for NexArt Protocol & Dashboard. Read our terms governing use of the NexArt services." />
      </Helmet>
      
      <PageHeader 
        title="Terms of Service"
        subtitle="NexArt Protocol & Dashboard"
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p className="text-sm text-muted-foreground mb-8">
            <strong>Effective date:</strong> 28 January 2026
          </p>

          <p>
            These Terms govern your use of the NexArt dashboard, CLI, SDK, and certification endpoints ("Services").
          </p>

          <h2>1. The Services</h2>
          
          <p>
            NexArt provides tooling for deterministic execution and optional certified rendering via a canonical renderer. The SDK/CLI may be used locally without charge. Certified usage may be subject to quotas, limits, or a commercial agreement.
          </p>

          <h2>2. Accounts and API Keys</h2>
          
          <p>
            You are responsible for maintaining the confidentiality of your API keys. Do not share keys publicly. We may rotate or revoke keys if we detect abuse or compromise.
          </p>

          <h2>3. Acceptable Use</h2>
          
          <p>You agree not to:</p>
          
          <ul>
            <li>Attempt to disrupt, probe, or overload the Services</li>
            <li>Circumvent quotas or access controls</li>
            <li>Use the Services for unlawful activity</li>
            <li>Interfere with other users' access</li>
          </ul>

          <h2>4. Quotas, Metering, and Plans</h2>
          
          <p>
            Certified runs may be capped by plan. We may enforce rate limits or temporarily suspend access to protect service reliability. Plan details may change over time. Plan limits are enforced at the account level and shared across all API keys associated with the account.
          </p>

          <h2>4A. Billing, Renewals, and Cancellation</h2>
          
          <p>
            Paid plans are billed in advance on a recurring basis (monthly or annually, depending on the plan selected). Subscriptions automatically renew unless cancelled before the end of the current billing period.
          </p>
          
          <p>
            Cancellation takes effect at the end of the current billing period. Access to certified services remains available until that time.
          </p>
          
          <p>
            Payments are processed by a third-party payment provider (Stripe). NexArt does not store full payment card details.
          </p>
          
          <p>
            Except where required by law, fees are non-refundable and unused certified runs do not roll over between billing periods.
          </p>

          <h2>5. Intellectual Property</h2>
          
          <p>
            You retain ownership of your code and outputs. NexArt retains ownership of the Services and related trademarks/branding.
          </p>

          <h2>6. No Warranty</h2>
          
          <p>
            The Services are provided "as is" without warranties of any kind.
          </p>

          <h2>7. Limitation of Liability</h2>
          
          <p>
            To the maximum extent permitted by law, NexArt is not liable for indirect, incidental, or consequential damages, or loss of data or profits.
          </p>

          <h2>8. Termination</h2>
          
          <p>
            We may suspend or terminate access for violations of these Terms or to protect system integrity.
          </p>

          <h2>9. Governing Law</h2>
          
          <p>
            These Terms are governed by the laws of United Kingdom.
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

export default Terms;
