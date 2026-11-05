"use client";

import { CARDS } from "@/lib/demo/data";
import { useDemoState } from "@/lib/demo/store";
import { LANGUAGE_INFO, type LanguageCode } from "@/lib/constants";
import { LANGUAGE_STYLES } from "@/lib/coasters";
import { Coaster } from "@/components/coaster";
import { SetCompleteModal } from "@/components/set-complete-modal";
import { PageHeader } from "@/components/page-header";

export function LanguageDetail({ code }: { code: LanguageCode }) {
  const { collected } = useDemoState();

  const langCards = CARDS.filter((card) => card.language_code === code).sort(
    (a, b) => a.item_slug.localeCompare(b.item_slug)
  );
  const collectedCount = langCards.filter((card) =>
    collected.includes(card.id)
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
            unlocked={collected.includes(card.id)}
          />
        ))}
      </div>

      {isComplete && (
        <SetCompleteModal languageCode={code} languageLabel={label} />
      )}
    </div>
  );
}
