import type { LanguageCode } from "@/lib/constants";

// Per-language accent color — the 3 coasters in a language all share one
// accent, reinforcing "3 languages" rather than colour-coding individual
// dishes.
export interface LanguageStyle {
  hue: number;
  badgeBg: string;
}

function hueColor(hue: number) {
  return `oklch(0.55 0.15 ${hue})`;
}

export const LANGUAGE_STYLES: Record<LanguageCode, LanguageStyle> = {
  ZU: { hue: 30, badgeBg: hueColor(30) },
  XH: { hue: 200, badgeBg: hueColor(200) },
  AF: { hue: 340, badgeBg: hueColor(340) },
};
