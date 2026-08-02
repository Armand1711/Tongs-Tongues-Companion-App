"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, LayoutGrid, Flame, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/collection", label: "Rack", icon: LayoutGrid },
  { href: "/feed", label: "Challenge", icon: Flame },
  { href: "/redeem", label: "Redeem", icon: MapPin },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex(({ href }) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="relative mx-auto max-w-md">
        {activeIndex >= 0 && (
          <div
            className="absolute top-0 h-0.5 w-1/5 rounded-full bg-primary transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
            aria-hidden
          />
        )}
        <ul className="flex items-stretch justify-between px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
            const isActive = index === activeIndex;

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
