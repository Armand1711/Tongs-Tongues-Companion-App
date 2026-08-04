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
          <div className="relative flex size-full flex-col items-center justify-center gap-1">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
              <polygon
                points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3"
                strokeDasharray="6 5"
              />
            </svg>
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
              <div
                className="coaster-shape absolute inset-0"
                style={{
                  background: badgeBg,
                  filter: `drop-shadow(0 0 28px ${badgeBg})`,
                }}
              />
              <div
                className="coaster-shape absolute inset-[7px] flex flex-col items-center justify-center gap-2.5"
                style={{
                  background:
                    "radial-gradient(circle at 35% 28%, oklch(0.3 0.05 45), oklch(0.12 0.012 40) 70%)",
                }}
              >
                <div
                  className="flex size-14 items-center justify-center rounded-full font-heading text-[17px] font-semibold text-weber-black"
                  style={{ background: badgeBg }}
                >
                  {mono}
                </div>
                <p className="font-heading text-xs uppercase tracking-wide text-weber-cream">
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
              <div
                className="coaster-shape absolute inset-0"
                style={{
                  background: "var(--weber-ember-start)",
                  filter:
                    "drop-shadow(0 0 28px var(--weber-ember-start))",
                }}
              />
              <div
                className="coaster-shape absolute inset-[7px] flex flex-col items-center justify-center gap-2 px-5 text-center"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, oklch(0.16 0.014 40), oklch(0.16 0.014 40) 8px, oklch(0.19 0.016 40) 8px, oklch(0.19 0.016 40) 16px)",
                }}
              >
                <p className="font-heading text-2xl font-bold tracking-wide text-weber-cream/90 italic">
                  {selected.word}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
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
                index === selectedIndex ? badgeBg : "oklch(1 0 0 / 12%)",
              boxShadow:
                index === selectedIndex ? `0 0 8px ${badgeBg}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
