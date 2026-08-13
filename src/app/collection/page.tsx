import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllCards, getCollectedCardIds } from "@/lib/supabase/queries";
import { ITEM_ORDER, TOTAL_CARDS, type ItemSlug } from "@/lib/constants";
import { COASTER_STYLES } from "@/lib/coasters";
import { PageHeader } from "@/components/page-header";

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
      <PageHeader
        title="Coaster Rack"
        subtitle={`${collectedCount} of ${TOTAL_CARDS} coasters collected`}
        watermark
      />

      <div className="flex flex-col gap-3">
        {ITEM_ORDER.map((slug) => {
          const itemCards = cards
            .filter((card) => card.item_slug === slug)
            .sort((a, b) => a.language_code.localeCompare(b.language_code));
          const itemName = itemCards[0]?.item_name ?? slug;
          const style = COASTER_STYLES[slug as ItemSlug];

          return (
            <Link
              key={slug}
              href={`/collection/${slug}`}
              className="sticker-border rounded-2xl bg-card p-4 transition-transform active:scale-[0.98]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-8 items-center justify-center rounded-[10px] font-heading text-[11px] font-semibold text-weber-black"
                    style={{ background: style.badgeBg }}
                  >
                    {style.mono}
                  </div>
                  <p className="font-heading text-sm uppercase tracking-wide text-foreground">
                    {itemName}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">View ›</span>
              </div>

              <div className="flex gap-2">
                {itemCards.map((card) => {
                  const unlocked = collectedIds.has(card.id);
                  return (
                    <div
                      key={card.id}
                      className="flex h-9 flex-1 items-center justify-center rounded-[10px] text-[10px] font-bold"
                      style={
                        unlocked
                          ? {
                              background: `oklch(0.55 0.15 ${style.hue} / 22%)`,
                              border: `1px solid oklch(0.55 0.15 ${style.hue} / 65%)`,
                              color: "var(--weber-black)",
                            }
                          : {
                              background: "oklch(0.22 0.02 40 / 4%)",
                              border: "1px dashed oklch(0.22 0.02 40 / 20%)",
                              color: "oklch(0.55 0.02 50)",
                            }
                      }
                    >
                      {unlocked ? card.language_code : "·"}
                    </div>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
