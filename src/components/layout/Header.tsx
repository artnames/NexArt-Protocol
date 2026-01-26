import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Grouped navigation
const navGroups = [
  {
    label: "Docs",
    items: [
      { href: "/docs/get-started", label: "Get Started" },
      { href: "/docs/cli", label: "CLI" },
      { href: "/docs/renderer-api", label: "Renderer API" },
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
    ],
  },
  {
    label: "Builders",
    items: [
      { href: "/builders", label: "SDKs" },
      { href: "/builder-manifest", label: "Manifest" },
      { href: "/builder-rewards", label: "Rewards" },
    ],
  },
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-mono text-sm font-medium tracking-wide text-foreground hover:text-caption transition-colors"
          >
            nexart.io
          </Link>
          
          {/* Burger Menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="p-2 -mr-2 text-caption hover:text-foreground transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-mono text-sm">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-6">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-mono text-caption uppercase tracking-wider mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`block px-3 py-2 text-sm rounded transition-colors ${
                            location.pathname === item.href
                              ? "text-foreground bg-muted font-medium"
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
