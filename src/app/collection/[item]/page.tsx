import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllCards, getCollectedCardIds } from "@/lib/supabase/queries";
import { ITEM_ORDER, type ItemSlug } from "@/lib/constants";
import { COASTER_STYLES } from "@/lib/coasters";
import { Coaster } from "@/components/coaster";
import { SetCompleteModal } from "@/components/set-complete-modal";
import { PageHeader } from "@/components/page-header";

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
      <PageHeader
        title={itemName}
        subtitle={`${collectedCount}/${itemCards.length} languages collected`}
        back={{ href: "/collection", label: "Rack" }}
        watermark
      />

      <Coaster
        languages={languages}
        badgeBg={style.badgeBg}
        mono={style.mono}
        initialIndex={requestedIndex >= 0 ? requestedIndex : undefined}
      />

      {isComplete && (
        <SetCompleteModal itemSlug={item} itemName={itemName} />
      )}
    </div>
  );
}
