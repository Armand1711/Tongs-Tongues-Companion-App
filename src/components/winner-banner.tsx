"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Mirrors the localStorage "seen" pattern in set-complete-modal.tsx — a
// voucher stays announced until the user actually opens the reveal screen.
export function WinnerBanner({ code }: { code: string }) {
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    // One-time read of an external system (localStorage) to decide whether
    // this device has already opened the winner reveal — not derivable from
    // render-time state, so an effect (not derived state) is correct here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(!!localStorage.getItem(`tt-voucher-seen:${code}`));
  }, [code]);

  if (seen) return null;

  return (
    <Link
      href="/feed/winner"
      className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-primary to-[#8a1a12] p-4 text-primary-foreground shadow-sm animate-glow-pulse"
    >
      <span className="font-heading text-sm font-semibold">
        🏆 You won this month&apos;s challenge!
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide">
        View →
      </span>
    </Link>
  );
}
