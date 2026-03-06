import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const ApiOverview = () => (
  <PageLayout>
    <SEOHead
      title="API Overview — NexArt"
      description="Overview of the NexArt API for programmatic CER creation and certification."
    />
    <PageHeader
      title="API Overview"
      subtitle="Programmatic access to NexArt execution certification."
    />
    <PageContent>
      <div className="prose-protocol">
        <p className="text-lg text-muted-foreground">
          The NexArt API enables programmatic creation and certification of execution records.
        </p>

        <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
          <p className="text-sm font-medium mb-2">Coming Soon</p>
          <p className="text-sm text-muted-foreground mb-0">
            The API is under active development. When available, it will support:
          </p>
          <ul className="text-sm text-muted-foreground mt-3 space-y-1 mb-0">
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">POST /v1/cer/ai/create</code> — Submit an AI execution snapshot for CER generation</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">POST /v1/cer/ai/certify</code> — Request canonical node certification of a CER</li>
          </ul>
        </div>

        <h2>Authentication</h2>
        <p>
          API access will require a project-scoped API key, provisioned from the NexArt dashboard.
        </p>

        <h2>Rate Limits &amp; Usage</h2>
        <p>
          Rate limits and usage quotas will be defined per plan tier. Details will be published when the API is available.
        </p>

        <p className="text-sm text-muted-foreground italic">
          Full API reference documentation will be available at{" "}
          <a href="https://docs.nexart.io" className="text-link hover:text-link-hover underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            docs.nexart.io
          </a>{" "}
          once endpoints are finalized.
        </p>
      </div>
    </PageContent>
  </PageLayout>
);

export default ApiOverview;
