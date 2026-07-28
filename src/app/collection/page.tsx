import Link from "next/link";
import { Flame, CookingPot, Utensils, Shirt, FlameKindling } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getAllCards,
  getCollectedCardIds,
  summarizeByItem,
} from "@/lib/supabase/queries";
import { ITEM_ORDER, type ItemSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ITEM_ICONS: Record<ItemSlug, typeof Flame> = {
  charcoal: Flame,
  kettle: CookingPot,
  tongs: Utensils,
  apron: Shirt,
  "chimney-starter": FlameKindling,
};

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cards = await getAllCards(supabase);
  const collectedIds = user
    ? await getCollectedCardIds(supabase, user.id)
    : new Set<string>();

  const progressBySlug = new Map(
    summarizeByItem(cards, collectedIds).map((p) => [p.itemSlug, p])
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Your Collection</p>
        <h1 className="font-heading text-3xl uppercase tracking-tight">
          Braai Essentials
        </h1>
        <p className="text-sm text-muted-foreground">
          Tap an item to see all five language cards.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {ITEM_ORDER.map((slug) => {
          const progress = progressBySlug.get(slug);
          const collected = progress?.collected ?? 0;
          const total = progress?.total ?? 5;
          const isComplete = collected === total;
          const Icon = ITEM_ICONS[slug];

          return (
            <Link
              key={slug}
              href={`/collection/${slug}`}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border bg-card p-5 text-center shadow-sm transition-transform active:scale-95",
                isComplete ? "border-primary" : "border-border"
              )}
            >
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-full",
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-7" />
              </div>
              <p className="font-heading text-sm uppercase tracking-wide">
                {progress?.itemName ?? slug}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {collected}/{total} languages
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
