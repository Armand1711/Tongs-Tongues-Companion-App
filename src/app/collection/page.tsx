import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllCards, getCollectedCardIds } from "@/lib/supabase/queries";
import { ITEM_ORDER, TOTAL_CARDS, type ItemSlug } from "@/lib/constants";
import { COASTER_STYLES } from "@/lib/coasters";
import { cn } from "@/lib/utils";

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cards = await getAllCards(supabase);
  const collectedIds = user
    ? await getCollectedCardIds(supabase, user.id)
    : new Set<string>();

  const collectedCount = collectedIds.size;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="space-y-1">
        <h1 className="font-heading text-xl font-bold uppercase tracking-tight">
          Coaster Rack
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {collectedCount} of {TOTAL_CARDS} coasters collected
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {ITEM_ORDER.map((slug) => {
          const itemCards = cards
            .filter((card) => card.item_slug === slug)
            .sort((a, b) => a.language_code.localeCompare(b.language_code));
          const itemName = itemCards[0]?.item_name ?? slug;
          const style = COASTER_STYLES[slug as ItemSlug];

          return (
            <div key={slug}>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="font-heading text-[13px] font-semibold uppercase tracking-wide text-foreground">
                  {itemName}
                </p>
                <Link
                  href={`/collection/${slug}`}
                  className="text-[11px] font-semibold text-primary"
                >
                  View →
                </Link>
              </div>
              <div className="flex gap-2.5">
                {itemCards.map((card) => {
                  const unlocked = collectedIds.has(card.id);
                  return (
                    <Link
                      key={card.id}
                      href={`/collection/${slug}?lang=${card.language_code}`}
                      aria-label={`${itemName} — ${card.language}`}
                      className={cn(
                        "flex size-[52px] shrink-0 items-center justify-center rounded-full transition-transform active:scale-90",
                        !unlocked && "border-2 border-dashed border-border"
                      )}
                      style={
                        unlocked
                          ? { background: style.badgeBg }
                          : { background: "var(--weber-cream)" }
                      }
                    >
                      {unlocked && (
                        <span className="font-heading text-[9px] tracking-wide text-weber-cream">
                          {card.language_code}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
