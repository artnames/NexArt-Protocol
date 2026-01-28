import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Privacy Policy - NexArt Protocol</title>
        <meta name="description" content="Privacy Policy for NexArt Protocol & Dashboard. Learn how we collect, use, and protect your data." />
      </Helmet>
      
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
            NexArt provides a developer dashboard and API access to certified deterministic rendering ("Certification Services").
          </p>

          <h2>What we collect</h2>
          
          <ul>
            <li><strong>Account data:</strong> email address and authentication identifiers (including Google OAuth, if used).</li>
            <li><strong>Usage data:</strong> API key usage metrics (counts, timestamps, success/error codes, and request duration).</li>
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

          <h2>Retention</h2>
          
          <p>
            We retain account and usage data for as long as your account is active, and for a reasonable period afterward for security, audit, and dispute resolution.
          </p>

          <h2>Your rights</h2>
          
          <p>
            You may request access, correction, or deletion of your account data by emailing: <a href="mailto:support@nexart.io" className="text-link hover:text-link-hover underline underline-offset-2">support@nexart.io</a>
          </p>

          <h2>Security</h2>
          
          <p>
            We use reasonable technical and organizational measures to protect data. No method of transmission or storage is 100% secure.
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
