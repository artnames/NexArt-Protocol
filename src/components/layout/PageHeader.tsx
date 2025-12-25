import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}

const PageHeader = ({ title, subtitle, badge }: PageHeaderProps) => {
  return (
    <div className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <div className="flex items-start gap-3 mb-4">
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-body text-lg max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
