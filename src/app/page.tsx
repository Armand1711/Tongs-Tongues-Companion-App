import Link from "next/link";
import { ScanLine, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getAllCards,
  getCollectedCardIds,
  getActiveChallenge,
  summarizeByLanguage,
} from "@/lib/supabase/queries";
import { LANGUAGE_ORDER, LANGUAGE_INFO, TOTAL_CARDS } from "@/lib/constants";
import { LANGUAGE_STYLES } from "@/lib/coasters";
import { Button } from "@/components/ui/button";
import { FlameGraphic } from "@/components/flame-graphic";

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

  const progressByLanguage = new Map(
    summarizeByLanguage(cards, collectedIds).map((p) => [p.languageCode, p])
  );
  const collectedCount = collectedIds.size;
  const progressPct = Math.round((collectedCount / TOTAL_CARDS) * 100);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-8">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="brand-wordmark font-brush text-4xl leading-none normal-case">
            Tongs &amp; Tongues
          </h1>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Weber South Africa
          </p>
        </div>
        <Link
          href="/account"
          aria-label="Account"
          className="btn-sticker flex size-[46px] items-center justify-center rounded-full bg-primary transition-transform active:scale-95"
        >
          <span className="font-heading text-xs font-semibold tracking-wide text-primary-foreground">
            T&amp;T
          </span>
        </Link>
      </header>

      {user?.is_anonymous && (
        <Link
          href="/signup"
          className="btn-sticker flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 transition-transform active:scale-[0.98]"
        >
          <p className="text-[13px] font-medium text-foreground">
            Browsing as a guest —{" "}
            <span className="text-primary">create an account</span> to save
            your progress
          </p>
          <ArrowRight className="size-4 shrink-0 text-primary" />
        </Link>
      )}

      <section className="sticker-border relative overflow-hidden rounded-3xl bg-weber-black p-[22px] text-weber-cream">
        <FlameGraphic className="pointer-events-none absolute -right-6 -bottom-10 h-40 w-40 text-white/5" />
        <div className="relative mb-3 flex items-baseline justify-between">
          <p className="font-heading text-xs uppercase tracking-[0.15em] text-weber-cream/60">
            Your Coasters
          </p>
          <p className="font-heading text-[15px] font-semibold">
            {collectedCount}
            <span className="text-weber-cream/60"> / {TOTAL_CARDS}</span>
          </p>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10">
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
        className="btn-sticker h-14 rounded-2xl bg-primary text-base font-heading uppercase tracking-wide text-primary-foreground active:scale-[0.99]"
      >
        <ScanLine className="size-5" />
        Scan a Coaster
      </Button>

      <section>
        <p className="mb-3 font-heading text-[13px] uppercase tracking-wide text-foreground">
          Your Languages
        </p>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGE_ORDER.map((code) => {
            const progress = progressByLanguage.get(code);
            const unlockedCount = progress?.collected ?? 0;
            const style = LANGUAGE_STYLES[code];

            return (
              <Link
                key={code}
                href={`/collection/${LANGUAGE_INFO[code].slug}`}
                className="sticker-border rounded-2xl bg-card p-3.5 transition-transform active:scale-[0.97]"
              >
                <div
                  className="flex size-10 items-center justify-center rounded-xl font-heading text-[13px] font-semibold text-weber-black"
                  style={{ background: style.badgeBg }}
                >
                  {code}
                </div>
                <p className="mt-2.5 font-heading text-[13px] font-semibold uppercase tracking-wide text-foreground">
                  {LANGUAGE_INFO[code].label}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {unlockedCount}/3 coasters
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {challenge && (
        <Link
          href="/feed"
          className="sticker-border relative flex items-center justify-between gap-3 overflow-hidden rounded-[20px] bg-primary p-[18px] text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <FlameGraphic className="pointer-events-none absolute -right-4 -top-6 h-28 w-28 text-white/15" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.15em] text-primary-foreground/80">
              🔥 This Month&apos;s Challenge
            </p>
            <p className="mt-1 font-heading text-sm font-semibold">
              {challenge.theme}
            </p>
          </div>
          <ArrowRight className="relative size-5 shrink-0 text-primary-foreground/80" />
        </Link>
      )}
    </div>
  );
}
