import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

// Navigation grouped by conceptual layers:
// Core Protocol → Execution & Compliance → Builders → Governance
const navGroups = [
  // Core Protocol
  {
    label: "Protocol",
    items: [
      { href: "/", label: "Home" },
      { href: "/protocol", label: "Overview" },
      { href: "/canonical-unit", label: "Canonical Unit" },
      { href: "/modes", label: "Modes" },
      { href: "/determinism", label: "Determinism" },
    ],
  },
  // Execution & Compliance
  {
    label: "Execution",
    items: [
      { href: "/code-mode", label: "Code Mode" },
      { href: "/canonical-renderer", label: "Renderer" },
      { href: "/protocol-compliance", label: "Compliance" },
    ],
  },
  // Builders
  {
    label: "Builders",
    items: [
      { href: "/builders", label: "SDKs" },
      { href: "/builder-manifest", label: "Manifest" },
      { href: "/builder-rewards", label: "Rewards" },
    ],
  },
  // Reference
  {
    label: "Reference",
    items: [
      { href: "/glossary", label: "Glossary" },
      { href: "/non-goals", label: "Non-Goals" },
      { href: "/governance", label: "Governance" },
    ],
  },
];

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-mono text-sm tracking-wide text-foreground hover:text-body transition-colors"
          >
            nexart.io
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex items-center">
                {groupIndex > 0 && (
                  <span className="mx-2 h-3 w-px bg-border" aria-hidden="true" />
                )}
                <div className="flex items-center gap-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`px-2.5 py-1.5 text-sm rounded-sm transition-colors ${
                        location.pathname === item.href
                          ? "text-foreground bg-muted"
                          : "text-caption hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2 text-caption hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-2 border-t border-border pt-4">
            <div className="space-y-4">
              {navGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <p className="text-xs font-mono text-caption uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
                          location.pathname === item.href
                            ? "text-foreground bg-muted"
                            : "text-caption hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
