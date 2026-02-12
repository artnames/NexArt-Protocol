import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Protocol */}
          <div>
            <h4 className="text-xs font-mono text-foreground mb-4 tracking-wide">Protocol</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/protocol" className="text-caption hover:text-foreground transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/code-mode" className="text-caption hover:text-foreground transition-colors">
                  Code Mode
                </Link>
              </li>
              <li>
                <Link to="/protocol-compliance" className="text-caption hover:text-foreground transition-colors">
                  Compliance
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-caption hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-caption hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-mono text-foreground mb-4 tracking-wide">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/builders" className="text-caption hover:text-foreground transition-colors">
                  Builders
                </Link>
              </li>
              <li>
                <Link to="/builder-manifest" className="text-caption hover:text-foreground transition-colors">
                  Builder Manifest
                </Link>
              </li>
              <li>
                <Link to="/glossary" className="text-caption hover:text-foreground transition-colors">
                  Glossary
                </Link>
              </li>
              <li>
                <Link to="/determinism" className="text-caption hover:text-foreground transition-colors">
                  Determinism
                </Link>
              </li>
              <li>
                <Link to="/governance" className="text-caption hover:text-foreground transition-colors">
                  Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Built with NexArt */}
          <div>
            <h4 className="text-xs font-mono text-foreground mb-4 tracking-wide">Apps</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://nexart.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  NexArt
                </a>
              </li>
              <li>
                <a
                  href="https://byxcollection.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  ByX
                </a>
              </li>
              <li>
                <a
                  href="https://velocity.recanon.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  Velocity
                </a>
              </li>
              <li>
                <a
                  href="https://recanon.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  Recanon
                </a>
              </li>
              <li>
                <a
                  href="https://nexartsciencelab.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  Science Lab
                </a>
              </li>
              <li>
                <a
                  href="https://frontierra.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  Frontierra
                </a>
              </li>
            </ul>
          </div>

          {/* Follow us */}
          <div>
            <h4 className="text-xs font-mono text-foreground mb-4 tracking-wide">Foundation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/artnames"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/ArtNames_io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  X
                </a>
              </li>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/nexartprotocol/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption hover:text-foreground transition-colors"
                >
                  linkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
          <div className="font-mono">
            <p>Code Mode Protocol v1.2.0 · SDK v1.8.4 — Locked & Stable</p>
            <p className="text-muted-foreground/70 mt-1">Changes require a protocol version increment.</p>
          </div>
          <p>© {new Date().getFullYear()} NexArt </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
