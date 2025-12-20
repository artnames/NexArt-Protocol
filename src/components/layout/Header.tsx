import { Link, useLocation } from "react-router-dom";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/protocol", label: "Protocol" },
  { href: "/canonical-unit", label: "Canonical Unit" },
  { href: "/modes", label: "Modes" },
  { href: "/determinism", label: "Determinism" },
  { href: "/glossary", label: "Glossary" },
  { href: "/non-goals", label: "Non-Goals" },
  { href: "/builders", label: "Builders" },
  { href: "/governance", label: "Governance" },
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
          
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {navItems.map((item) => (
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
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
