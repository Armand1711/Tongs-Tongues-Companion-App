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
    <nav className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md">
      <ul
        className="flex items-center justify-around rounded-[24px] border border-white/10 px-2 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
        style={{ background: "oklch(0.14 0.012 40 / 78%)" }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
          const isActive = index === activeIndex;

          return (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center gap-1 px-1.5 py-1"
              >
                <span
                  className={cn(
                    "flex h-[30px] w-10 items-center justify-center rounded-xl transition-colors duration-200",
                    isActive && "bg-primary/20"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] transition-transform duration-200",
                      isActive
                        ? "scale-110 text-weber-ember"
                        : "text-muted-foreground"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden
                  />
                </span>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wide",
                    isActive ? "text-foreground" : "text-muted-foreground/70"
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
