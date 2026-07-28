import Link from "next/link";
import { ScanLine, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllCards, getCollectedCardIds } from "@/lib/supabase/queries";
import { TOTAL_CARDS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let collectedCount = 0;
  if (user) {
    const [cards, collectedIds] = await Promise.all([
      getAllCards(supabase),
      getCollectedCardIds(supabase, user.id),
    ]);
    collectedCount = cards.filter((card) => collectedIds.has(card.id)).length;
  }

  const progressPct = Math.round((collectedCount / TOTAL_CARDS) * 100);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 pt-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Weber South Africa</p>
        <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight text-foreground">
          Tongs &amp; Tongues
        </h1>
        <p className="text-sm text-muted-foreground">
          Scan the QR code on every Weber braai essential to collect its card
          and learn its name in five South African languages.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="font-heading text-sm uppercase tracking-wide text-muted-foreground">
            Your Progress
          </span>
          <span className="font-heading text-lg font-semibold">
            {collectedCount}/{TOTAL_CARDS}
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Collect all 5 language cards for an item to unlock its reward.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <Button
          render={<Link href="/scan" />}
          nativeButton={false}
          size="lg"
          className="h-14 rounded-2xl text-base font-heading uppercase tracking-wide"
        >
          <ScanLine className="size-5" />
          Scan a Card
        </Button>
        <Button
          render={<Link href="/collection" />}
          nativeButton={false}
          variant="outline"
          size="lg"
          className="h-14 rounded-2xl border-border bg-transparent text-base font-heading uppercase tracking-wide"
        >
          <LayoutGrid className="size-5" />
          View Collection
        </Button>
      </section>
    </div>
  );
}
