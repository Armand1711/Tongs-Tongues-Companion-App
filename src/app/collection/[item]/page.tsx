import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllCards, getCollectedCardIds } from "@/lib/supabase/queries";
import { ITEM_ORDER, type ItemSlug } from "@/lib/constants";
import { COASTER_STYLES } from "@/lib/coasters";
import { Coaster } from "@/components/coaster";
import { SetCompleteModal } from "@/components/set-complete-modal";

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ item: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { item } = await params;
  const { lang } = await searchParams;

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
  const style = COASTER_STYLES[item as ItemSlug];

  const languages = itemCards.map((card) => ({
    code: card.language_code,
    label: card.language,
    word: card.word,
    phonetic: card.phonetic,
    unlocked: collectedIds.has(card.id),
  }));
  const requestedIndex = lang
    ? languages.findIndex((l) => l.code === lang)
    : -1;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <Link
        href="/collection"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Rack
      </Link>

      <header className="space-y-1">
        <h1 className="font-heading text-xl font-bold uppercase tracking-tight">
          {itemName}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {collectedCount}/{itemCards.length} languages collected
        </p>
      </header>

      <Coaster
        languages={languages}
        badgeBg={style.badgeBg}
        mono={style.mono}
        initialIndex={requestedIndex >= 0 ? requestedIndex : undefined}
      />

      {isComplete && (
        <div className="rounded-2xl bg-weber-black p-4 text-center text-weber-cream">
          <p className="font-heading text-[13px] uppercase tracking-wide">
            Set Complete
          </p>
          <p className="mt-1 text-xs text-weber-cream/70">
            10% off {itemName} at participating retailers
          </p>
        </div>
      )}

      {isComplete && (
        <SetCompleteModal itemSlug={item} itemName={itemName} />
      )}
    </div>
  );
}
