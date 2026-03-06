import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";

const ApiCertification = () => (
  <PageLayout>
    <SEOHead
      title="Certification — NexArt API"
      description="Submit CERs for canonical node certification via the NexArt API."
    />
    <PageHeader
      title="Certification"
      subtitle="POST /v1/cer/ai/certify"
    />
    <PageContent>
      <div className="prose-protocol">
        <div className="bg-muted/50 border border-border rounded-md p-5 my-6">
          <p className="text-sm font-medium mb-2">Coming Soon</p>
          <p className="text-sm text-muted-foreground mb-0">
            This endpoint is under development. It will accept a CER identifier and request certification from the NexArt canonical verification node.
          </p>
        </div>

        <h2>Intended Request</h2>
        <pre className="bg-muted border border-border rounded-md p-4 text-xs font-mono overflow-x-auto">
{`POST /v1/cer/ai/certify
Content-Type: application/json
Authorization: Bearer <api-key>

{
  "cer_id": "...",
  "certificate_hash": "sha256:..."
}`}
        </pre>

        <h2>Intended Response</h2>
        <pre className="bg-muted border border-border rounded-md p-4 text-xs font-mono overflow-x-auto">
{`{
  "cer_id": "...",
  "certification_status": "certified",
  "node_signature": "...",
  "certified_at": "2026-03-06T..."
}`}
        </pre>

        <p className="text-sm text-muted-foreground italic">
          Request and response schemas are preliminary and subject to change before release.
        </p>
      </div>
    </PageContent>
  </PageLayout>
);

export default ApiCertification;
