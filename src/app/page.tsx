import Link from "next/link";
import { ScanLine, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getAllCards,
  getCollectedCardIds,
  getActiveChallenge,
  summarizeByItem,
} from "@/lib/supabase/queries";
import { ITEM_ORDER, TOTAL_CARDS } from "@/lib/constants";
import { COASTER_STYLES } from "@/lib/coasters";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [cards, collectedIds, challenge] = await Promise.all([
    getAllCards(supabase),
    user ? getCollectedCardIds(supabase, user.id) : Promise.resolve(new Set<string>()),
    getActiveChallenge(supabase),
  ]);

  const progressBySlug = new Map(
    summarizeByItem(cards, collectedIds).map((p) => [p.itemSlug, p])
  );
  const collectedCount = collectedIds.size;
  const progressPct = Math.round((collectedCount / TOTAL_CARDS) * 100);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-8">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="font-heading text-2xl uppercase tracking-tight text-foreground">
            Tongs &amp; Tongues
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Weber South Africa
          </p>
        </div>
        <Link
          href="/account"
          aria-label="Account"
          className="flex size-[46px] items-center justify-center rounded-full shadow-[0_0_20px_oklch(0.6_0.2_30_/_55%)] transition-transform active:scale-95"
          style={{
            background:
              "conic-gradient(from 180deg, var(--weber-ember-start), var(--weber-ember-end), var(--weber-ember-start))",
          }}
        >
          <div className="flex size-[38px] items-center justify-center rounded-full bg-weber-black font-heading text-xs font-semibold tracking-wide text-weber-cream">
            T&amp;T
          </div>
        </Link>
      </header>

      <section
        className="relative overflow-hidden rounded-3xl border border-white/8 p-[22px] text-weber-cream"
        style={{
          background:
            "linear-gradient(155deg, oklch(0.2 0.02 40), oklch(0.13 0.014 40))",
        }}
      >
        <div className="mb-3 flex items-baseline justify-between">
          <p className="font-heading text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Your Coasters
          </p>
          <p className="font-heading text-[15px] font-semibold">
            {collectedCount}
            <span className="text-muted-foreground"> / {TOTAL_CARDS}</span>
          </p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="progress-ember-fill h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </section>

      <Button
        render={<Link href="/scan" />}
        nativeButton={false}
        size="lg"
        className="h-14 rounded-[20px] border-0 text-base font-heading uppercase tracking-wide shadow-[0_10px_30px_oklch(0.55_0.22_25_/_45%)] active:scale-[0.97]"
        style={{
          background:
            "linear-gradient(135deg, var(--weber-ember-start), var(--weber-ember-end))",
        }}
      >
        <ScanLine className="size-5" />
        Scan a Coaster
      </Button>

      <section>
        <p className="mb-3 font-heading text-[13px] uppercase tracking-wide text-foreground">
          Your Rack
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ITEM_ORDER.map((slug) => {
            const progress = progressBySlug.get(slug);
            const unlockedCount = progress?.collected ?? 0;
            const style = COASTER_STYLES[slug];

            return (
              <Link
                key={slug}
                href={`/collection/${slug}`}
                className="rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-transform active:scale-[0.97]"
              >
                <div
                  className="flex size-10 items-center justify-center rounded-xl font-heading text-[13px] font-semibold text-weber-black"
                  style={{ background: style.badgeBg }}
                >
                  {style.mono}
                </div>
                <p className="mt-2.5 font-heading text-[13px] font-semibold uppercase tracking-wide text-foreground">
                  {progress?.itemName ?? slug}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {unlockedCount}/5 languages
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {challenge && (
        <Link
          href="/feed"
          className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 p-[18px] text-weber-cream transition-transform active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(120deg, oklch(0.3 0.15 30), oklch(0.24 0.16 20))",
          }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-weber-ember/85">
              🔥 This Month&apos;s Challenge
            </p>
            <p className="mt-1 font-heading text-sm font-semibold">
              {challenge.theme}
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-weber-cream/70" />
        </Link>
      )}
    </div>
  );
}
