import { Link, useLocation } from "react-router-dom";

// Navigation grouped by conceptual layers:
// Core Protocol → Execution & Compliance → Builders → Governance
const navGroups = [
  // Core Protocol
  {
    items: [
      { href: "/", label: "Home" },
      { href: "/protocol", label: "Protocol" },
      { href: "/canonical-unit", label: "Canonical Unit" },
      { href: "/modes", label: "Modes" },
      { href: "/determinism", label: "Determinism" },
      { href: "/non-goals", label: "Non-Goals" },
      { href: "/glossary", label: "Glossary" },
    ],
  },
  // Execution & Compliance
  {
    items: [
      { href: "/protocol-compliance", label: "Compliance" },
      { href: "/canonical-renderer", label: "Canonical Renderer" },
      { href: "/code-mode", label: "Code Mode" },
    ],
  },
  // Builders
  {
    items: [
      { href: "/builders", label: "Builders" },
      { href: "/builder-manifest", label: "Builder Manifest" },
      { href: "/builder-rewards", label: "Builder Rewards" },
    ],
  },
  // Governance
  {
    items: [
      { href: "/governance", label: "Governance" },
    ],
  },
];

const Header = () => {
  const location = useLocation();

  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link to="/" className="font-mono text-sm tracking-wide text-foreground hover:text-body">
            nexart.io
          </Link>
          
          <nav className="flex flex-wrap items-center gap-y-2">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex items-center">
                {groupIndex > 0 && (
                  <span className="mx-3 h-3 w-px bg-border" aria-hidden="true" />
                )}
                <div className="flex flex-wrap gap-x-4">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`text-sm transition-colors ${
                        location.pathname === item.href
                          ? "text-foreground"
                          : "text-caption hover:text-body"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
