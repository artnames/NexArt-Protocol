import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/seo/SEOHead";
import PageLayout from "@/components/layout/PageLayout";
import PageContent from "@/components/layout/PageContent";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout>
      <SEOHead 
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        noindex={true}
      />
      <PageContent>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">404</h1>
            <p className="mb-4 text-xl text-muted-foreground">Page not found</p>
            <a href="/" className="text-primary underline hover:text-primary/90">
              Return to Home
            </a>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default NotFound;
