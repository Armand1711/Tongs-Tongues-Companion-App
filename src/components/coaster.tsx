"use client";

import { useState } from "react";
import Image from "next/image";

export function Coaster({
  dishName,
  phrase,
  meaning,
  imageUrl,
  badgeBg,
  unlocked,
}: {
  dishName: string;
  phrase: string;
  meaning: string;
  imageUrl: string | null;
  badgeBg: string;
  unlocked: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => unlocked && setIsFlipped((f) => !f)}
        aria-label={unlocked ? "Flip coaster" : "Locked coaster"}
        className="relative aspect-square w-full [perspective:1200px]"
      >
        {!unlocked ? (
          <div className="coaster-shape flex size-full flex-col items-center justify-center gap-1 border-[3px] border-dashed border-weber-black/25 bg-card/60">
            <p className="font-heading text-xs uppercase tracking-wide text-muted-foreground">
              Locked
            </p>
          </div>
        ) : (
          <div
            className="animate-coaster-drop absolute inset-0 transition-transform duration-[600ms] [transform-style:preserve-3d]"
            style={{
              transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* front */}
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <div className="coaster-shape coaster-frame sticker-border absolute inset-0 overflow-hidden bg-card">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={dishName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 90vw, 400px"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center px-4 text-center"
                    style={{ background: badgeBg }}
                  >
                    <span className="font-heading text-sm text-weber-black">
                      {dishName}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 rounded-b-[23px] bg-weber-black/75 px-3 py-2 text-center">
                <p className="font-heading text-[11px] uppercase tracking-wide text-weber-cream">
                  {dishName}
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
                <p className="font-heading text-xl font-bold tracking-wide text-weber-white">
                  {phrase}
                </p>
                <p className="text-xs italic text-weber-cream/85">{meaning}</p>
              </div>
            </div>
          </div>
        )}
      </button>

      <p className="text-center text-[11px] text-muted-foreground">
        {unlocked ? "Tap the coaster to flip it" : "Scan this coaster to unlock it"}
      </p>
    </div>
  );
}
