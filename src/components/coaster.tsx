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
        className="relative size-56 [perspective:1200px]"
      >
        {!selected.unlocked ? (
          <div className="coaster-shape relative flex size-full flex-col items-center justify-center gap-1 border-[3px] border-dashed border-weber-black/25 bg-card/60">
            <p className="font-heading text-xs uppercase tracking-wide text-muted-foreground">
              Locked
            </p>
          </div>
        ) : (
          <div
            key={selectedIndex}
            className="animate-coaster-drop absolute inset-0 transition-transform duration-[600ms] [transform-style:preserve-3d]"
            style={{
              transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* front */}
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <div className="coaster-shape coaster-frame sticker-border absolute inset-0 bg-card" />
              <div className="coaster-shape absolute inset-[8px] flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-weber-black/20">
                <div
                  className="flex size-14 items-center justify-center rounded-full font-heading text-[17px] font-semibold text-weber-black"
                  style={{ background: badgeBg }}
                >
                  {mono}
                </div>
                <p className="font-heading text-xs uppercase tracking-wide text-foreground">
                  {selected.label}
                </p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Tap to flip
                </p>
              </div>
            </div>

            {/* back */}
            <div
              className="absolute inset-0 [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="coaster-shape coaster-frame sticker-border absolute inset-0 bg-primary" />
              <div
                className="coaster-shape absolute inset-[8px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-weber-white/40 px-5 text-center"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, color-mix(in srgb, var(--weber-red) 92%, black), color-mix(in srgb, var(--weber-red) 92%, black) 8px, var(--weber-red) 8px, var(--weber-red) 16px)",
                }}
              >
                <p className="font-heading text-2xl font-bold tracking-wide text-weber-white italic">
                  {selected.word}
                </p>
                <p className="font-mono text-xs text-weber-cream/80">
                  {selected.phonetic}
                </p>
              </div>
            </div>
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
              background:
                index === selectedIndex ? badgeBg : "oklch(0.22 0.02 40 / 16%)",
              boxShadow:
                index === selectedIndex ? `0 0 8px ${badgeBg}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
