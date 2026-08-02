"use client";

import { useState } from "react";

export interface CoasterLanguage {
  code: string;
  label: string;
  word: string;
  phonetic: string;
  unlocked: boolean;
}

export function Coaster({
  languages,
  badgeBg,
  mono,
  initialIndex,
}: {
  languages: CoasterLanguage[];
  badgeBg: string;
  mono: string;
  initialIndex?: number;
}) {
  const firstUnlocked = languages.findIndex((lang) => lang.unlocked);
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex !== undefined && initialIndex >= 0
      ? initialIndex
      : firstUnlocked >= 0
        ? firstUnlocked
        : 0
  );
  const [isFlipped, setIsFlipped] = useState(false);

  const selected = languages[selectedIndex];

  function selectLang(index: number) {
    setSelectedIndex(index);
    setIsFlipped(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => selected.unlocked && setIsFlipped((f) => !f)}
        aria-label={selected.unlocked ? "Flip coaster" : "Locked coaster"}
        className="flex size-56 items-center justify-center rounded-full"
      >
        {selected.unlocked ? (
          <div
            key={`${selectedIndex}-${isFlipped}`}
            className="animate-coaster-drop flex size-full flex-col items-center justify-center rounded-full shadow-lg"
            style={
              isFlipped
                ? {
                    border: "8px solid var(--weber-red)",
                    background:
                      "repeating-linear-gradient(45deg, #8a6a4a, #8a6a4a 6px, #7a5c3f 6px, #7a5c3f 12px)",
                  }
                : {
                    border: `8px solid ${badgeBg}`,
                    background:
                      "radial-gradient(circle at 35% 30%, #241a15, #0c0c0c 70%)",
                  }
            }
          >
            {isFlipped ? (
              <>
                <p className="font-heading text-2xl font-bold tracking-wide text-weber-cream">
                  {selected.word}
                </p>
                <p className="mt-1.5 text-xs text-weber-cream/85">
                  {selected.phonetic}
                </p>
              </>
            ) : (
              <>
                <div
                  className="mb-3 flex size-14 items-center justify-center rounded-full font-heading text-[17px] font-semibold text-white"
                  style={{ background: badgeBg }}
                >
                  {mono}
                </div>
                <p className="font-heading text-xs uppercase tracking-wide text-weber-cream">
                  {selected.label}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex size-full flex-col items-center justify-center rounded-full border-3 border-dashed border-border">
            <p className="font-heading text-xs uppercase tracking-wide text-muted-foreground">
              Locked
            </p>
          </div>
        )}
      </button>

      <p className="text-center text-[11px] text-muted-foreground">
        {selected.unlocked
          ? "Tap the coaster to flip it"
          : "Scan a coaster to unlock this language"}
      </p>

      <div className="flex justify-center gap-2">
        {languages.map((lang, index) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => selectLang(index)}
            aria-label={`Show ${lang.label}`}
            className="size-2.5 rounded-full transition-colors"
            style={{
              background: index === selectedIndex ? badgeBg : "var(--weber-border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
