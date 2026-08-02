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
        <div className="flex size-9 items-center justify-center rounded-full bg-weber-black font-heading text-[13px] font-semibold text-weber-cream">
          TT
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[20px] bg-weber-black p-6 text-weber-cream">
        <p className="font-heading text-xs uppercase tracking-[0.15em] text-weber-cream/60">
          Your Coasters
        </p>
        <div className="mt-1.5 mb-4 flex items-baseline gap-2">
          <span className="font-heading text-4xl font-bold">
            {collectedCount}
          </span>
          <span className="text-sm text-weber-cream/60">
            / {TOTAL_CARDS} unlocked
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
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
        className="h-14 rounded-2xl text-base font-heading uppercase tracking-wide active:scale-[0.97]"
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
                  className="flex size-10 items-center justify-center rounded-full font-heading text-[13px] font-semibold text-white"
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
          className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-primary to-[#8a1a12] p-4 text-primary-foreground shadow-sm transition-transform active:scale-[0.98]"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-primary-foreground/70">
              This Month&apos;s Challenge
            </p>
            <p className="mt-1 font-heading text-sm font-semibold">
              {challenge.theme}
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0" />
        </Link>
      )}
    </div>
  );
}
