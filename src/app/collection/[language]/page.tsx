import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllCards, getCollectedCardIds } from "@/lib/supabase/queries";
import { LANGUAGE_INFO, languageSlugToCode } from "@/lib/constants";
import { LANGUAGE_STYLES } from "@/lib/coasters";
import { Coaster } from "@/components/coaster";
import { SetCompleteModal } from "@/components/set-complete-modal";
import { PageHeader } from "@/components/page-header";

export default async function LanguageDetailPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const code = languageSlugToCode(language);

  if (!code) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allCards = await getAllCards(supabase);
  const langCards = allCards
    .filter((card) => card.language_code === code)
    .sort((a, b) => a.item_slug.localeCompare(b.item_slug));

  if (langCards.length === 0) {
    notFound();
  }

  const collectedIds = user
    ? await getCollectedCardIds(supabase, user.id)
    : new Set<string>();

  const collectedCount = langCards.filter((card) =>
    collectedIds.has(card.id)
  ).length;
  const isComplete = collectedCount === langCards.length;
  const style = LANGUAGE_STYLES[code];
  const label = LANGUAGE_INFO[code].label;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title={`${label} Coasters`}
        subtitle={`${collectedCount}/${langCards.length} collected`}
        back={{ href: "/collection", label: "Rack" }}
        watermark
      />

      <div className="grid grid-cols-2 gap-4">
        {langCards.map((card) => (
          <Coaster
            key={card.id}
            dishName={card.item_name}
            phrase={card.word}
            meaning={card.phonetic}
            imageUrl={card.image_url}
            badgeBg={style.badgeBg}
            unlocked={collectedIds.has(card.id)}
          />
        ))}
      </div>

      {isComplete && (
        <SetCompleteModal languageCode={code} languageLabel={label} />
      )}
    </div>
  );
}
