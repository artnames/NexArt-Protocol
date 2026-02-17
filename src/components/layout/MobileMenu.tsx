import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { navGroups, standaloneItems } from "./Header";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileMenu = ({ open, onOpenChange }: MobileMenuProps) => {
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                    onClick={() => onOpenChange(false)}
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
          <div>
            <p className="text-xs font-mono text-caption uppercase tracking-wider mb-2">
              More
            </p>
            <div className="space-y-1">
              {standaloneItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => onOpenChange(false)}
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
  );
};

export default MobileMenu;
