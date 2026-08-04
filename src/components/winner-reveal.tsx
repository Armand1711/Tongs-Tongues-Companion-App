"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { emberBurst } from "@/components/ember-field";

export function WinnerReveal({
  code,
  theme,
}: {
  code: string;
  theme: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(`tt-voucher-seen:${code}`, "1");
    emberBurst(60);
  }, [code]);

  function copyCode() {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative overflow-hidden px-6 py-8 text-center">
      <div className="animate-glow-pulse mx-auto mb-4 flex size-28 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--weber-ember),var(--weber-red)_70%)]">
        <Trophy className="size-11 text-white" />
      </div>

      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
        You Won!
      </h1>
      <p className="mt-1.5 mb-6 text-[13px] text-muted-foreground">
        Congratulations — you topped &ldquo;{theme}&rdquo;
      </p>

      <div className="mb-4 rounded-2xl border-2 border-dashed border-primary bg-card p-5">
        <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Voucher Code
        </p>
        <p className="mb-3.5 font-heading text-xl font-bold tracking-wide text-foreground">
          {code}
        </p>
        <button
          type="button"
          onClick={copyCode}
          className="rounded-[10px] bg-weber-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-weber-cream"
        >
          {copied ? "Copied ✓" : "Copy Code"}
        </button>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        Redeem 10% off at any participating retailer — see the Redeem tab.
      </p>

      <Link
        href="/feed"
        className="block w-full rounded-2xl border border-border py-3.5 text-center font-heading text-[13px] font-semibold uppercase tracking-wide text-foreground"
      >
        Back to Challenge
      </Link>
    </div>
  );
}
