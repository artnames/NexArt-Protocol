import { ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
}

const PageContent = ({ children }: PageContentProps) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
      <div className="max-w-prose">
        {children}
      </div>
    </div>
  );
};

export default PageContent;
