import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllCards, getCollectedCardIds } from "@/lib/supabase/queries";
import { ITEM_ORDER, type ItemSlug } from "@/lib/constants";
import { LanguageCard } from "@/components/language-card";
import { SetCompleteModal } from "@/components/set-complete-modal";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const { item } = await params;

  if (!ITEM_ORDER.includes(item as ItemSlug)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allCards = await getAllCards(supabase);
  const itemCards = allCards
    .filter((card) => card.item_slug === item)
    .sort((a, b) => a.language_code.localeCompare(b.language_code));

  if (itemCards.length === 0) {
    notFound();
  }

  const collectedIds = user
    ? await getCollectedCardIds(supabase, user.id)
    : new Set<string>();

  const collectedCount = itemCards.filter((card) =>
    collectedIds.has(card.id)
  ).length;
  const isComplete = collectedCount === itemCards.length;
  const itemName = itemCards[0].item_name;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <Link
        href="/collection"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Collection
      </Link>

      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">
          {collectedCount}/{itemCards.length} languages
        </p>
        <h1 className="font-heading text-3xl uppercase tracking-tight">
          {itemName}
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {itemCards.map((card) => (
          <LanguageCard
            key={card.id}
            card={card}
            unlocked={collectedIds.has(card.id)}
          />
        ))}
      </div>

      {isComplete && (
        <SetCompleteModal itemSlug={item} itemName={itemName} />
      )}
    </div>
  );
}
