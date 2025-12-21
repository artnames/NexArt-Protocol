const Footer = () => {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-caption">
          <p>NexArt Protocol (v0.x) · Current version: v0.4</p>
          <p>
            Reference application:{" "}
            <a
              href="https://nexart.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body underline underline-offset-2 hover:text-foreground"
            >
              nexart.xyz
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
