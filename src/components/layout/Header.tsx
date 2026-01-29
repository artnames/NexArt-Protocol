import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      { href: "/builders/quickstart", label: "Quickstart" },
      { href: "/builders/cli", label: "CLI" },
      { href: "/builders/certification", label: "Certification" },
      { href: "/builders", label: "SDKs" },
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

// Standalone nav items (not in dropdowns)
const standaloneItems = [
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if current path is within a group
  const isGroupActive = (items: { href: string }[]) => {
    return items.some((item) => location.pathname === item.href);
  };

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
          
          {/* Desktop Navigation with Dropdowns */}
          <nav className="hidden md:flex items-center gap-1">
            {navGroups.map((group) => (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                      isGroupActive(group.items)
                        ? "text-foreground font-medium"
                        : "text-caption hover:text-foreground"
                    }`}
                  >
                    {group.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="z-50 min-w-[160px] bg-background border border-border shadow-lg"
                >
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={`w-full cursor-pointer ${
                          location.pathname === item.href
                            ? "bg-muted font-medium"
                            : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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

          {/* Mobile Burger Menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 -mr-2 text-caption hover:text-foreground transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-mono text-sm">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-6 pb-6">
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
                {/* Standalone items in mobile */}
                <div>
                  <p className="text-xs font-mono text-caption uppercase tracking-wider mb-2">
                    More
                  </p>
                  <div className="space-y-1">
                    {standaloneItems.map((item) => (
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
