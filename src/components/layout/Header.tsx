import { useState, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

// Lazy-load the mobile menu (Sheet is heavy Radix component)
const MobileMenu = lazy(() => import("./MobileMenu"));

// Grouped navigation
const navGroups = [
  {
    label: "Certification",
    items: [
      { href: "/docs/certification/code-mode", label: "Code Mode" },
      { href: "/docs/certification/ai-execution", label: "AI Execution" },
      { href: "/docs/certification/verify", label: "Verify Independently" },
      { href: "/docs/certification/node-stamps", label: "Node Stamps & Keys" },
    ],
  },
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
  {
    label: "Execution",
    items: [
      { href: "/code-mode", label: "Code Mode" },
      { href: "/canonical-renderer", label: "Renderer" },
      { href: "/protocol-compliance", label: "Compliance" },
      { href: "/protocol/ai-execution-integrity", label: "AI Integrity" },
    ],
  },
  {
    label: "Builders",
    items: [
      { href: "/builders/quickstart", label: "Quickstart" },
      { href: "/builders/cli", label: "CLI" },
      { href: "/builders/certification", label: "Certification" },
      { href: "/builders", label: "SDKs" },
    ],
  },
  {
    label: "Demos",
    items: [
      { href: "/demos/ai-execution", label: "AI Execution Integrity" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/faq", label: "FAQ" },
      { href: "/glossary", label: "Glossary" },
      { href: "/non-goals", label: "Non-Goals" },
      { href: "/governance", label: "Governance" },
      { href: "/security", label: "Security" },
      { href: "/reference/standards", label: "Standards Alignment" },
    ],
  },
];

// Standalone nav items (not in dropdowns)
const standaloneItems = [
  { href: "/verify", label: "Verify" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export { navGroups, standaloneItems };

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isGroupActive = (items: { href: string }[]) =>
    items.some((item) => location.pathname === item.href);

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-mono text-sm font-medium tracking-wide text-foreground hover:text-caption transition-colors"
          >
            nexart.io
          </Link>

          {/* Desktop: CSS-only hover dropdowns (no Radix) */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navGroups.map((group) => (
              <div key={group.label} className="relative group">
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                    isGroupActive(group.items)
                      ? "text-foreground font-medium"
                      : "text-caption hover:text-foreground"
                  }`}
                >
                  {group.label}
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div className="absolute left-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
                  <div className="min-w-[160px] bg-background border border-border rounded-md shadow-lg py-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-1.5 text-sm transition-colors ${
                          location.pathname === item.href
                            ? "bg-muted font-medium text-foreground"
                            : "text-caption hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {standaloneItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  location.pathname === item.href
                    ? "text-foreground font-medium"
                    : "text-caption hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 -mr-2 text-caption hover:text-foreground transition-colors"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile menu: lazy-loaded */}
          {menuOpen && (
            <Suspense fallback={null}>
              <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
