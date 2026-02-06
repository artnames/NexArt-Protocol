import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * PageLayout provides consistent structure for public pages.
 * Individual pages are responsible for their own SEO metadata via SEOHead component.
 */
const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
