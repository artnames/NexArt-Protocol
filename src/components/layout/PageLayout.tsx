import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CanonicalHead from "@/components/seo/CanonicalHead";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <CanonicalHead />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
