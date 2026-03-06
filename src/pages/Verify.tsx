import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const VERIFY_URL = "https://verify.nexart.io";
const DOCS_URL = "https://docs.nexart.io";

export default function Verify() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = VERIFY_URL;
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageLayout>
      <SEOHead
        title="Verify — NexArt"
        description="Verify Certified Execution Records at verify.nexart.io."
      />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md text-center space-y-6">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Verification has moved
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use the public NexArt verification portal at{" "}
            <a
              href={VERIFY_URL}
              className="text-link underline underline-offset-2"
            >
              verify.nexart.io
            </a>{" "}
            to upload, inspect, and verify Certified Execution Records (CERs).
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button asChild>
              <a href={VERIFY_URL}>
                Open verify.nexart.io
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </a>
            </Button>
            <a
              href={DOCS_URL}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Learn how verification works
            </a>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/60">
            Redirecting automatically…
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
