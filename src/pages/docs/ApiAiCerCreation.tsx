import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const ApiAiCerCreation = () => (
  <PageLayout>
    <SEOHead
      title="AI CER Creation — NexArt API"
      description="Create Certified Execution Records for AI workflows via the NexArt API."
    />
    <PageHeader
      title="AI CER Creation"
      subtitle="POST /v1/cer/ai/create"
    />
    <PageContent>
      <div className="prose-protocol">
        <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
          <p className="text-sm font-medium mb-2">Coming Soon</p>
          <p className="text-sm text-muted-foreground mb-0">
            This endpoint is under development. It will accept an AI execution snapshot and return a Certified Execution Record (CER) with a deterministic hash.
          </p>
        </div>

        <h2>Intended Request</h2>
        <pre className="bg-muted border border-border rounded-md p-4 text-xs font-mono overflow-x-auto">
{`POST /v1/cer/ai/create
Content-Type: application/json
Authorization: Bearer <api-key>

{
  "snapshot": { ... },
  "app_id": "your-app-id"
}`}
        </pre>

        <h2>Intended Response</h2>
        <pre className="bg-muted border border-border rounded-md p-4 text-xs font-mono overflow-x-auto">
{`{
  "cer_id": "...",
  "certificate_hash": "sha256:...",
  "execution_id": "...",
  "status": "created"
}`}
        </pre>

        <p className="text-sm text-muted-foreground italic">
          Request and response schemas are preliminary and subject to change before release.
        </p>
      </div>
    </PageContent>
  </PageLayout>
);

export default ApiAiCerCreation;
