interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
          {title}
        </h1>
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
