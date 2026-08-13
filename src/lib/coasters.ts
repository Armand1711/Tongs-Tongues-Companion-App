import type { ItemSlug } from "@/lib/constants";

// Per-item coaster styling — monogram + rim/badge color shown on the
// coaster face before it's flipped, matching the physical coaster concept
// instead of a generic rectangular card.
export interface CoasterStyle {
  mono: string;
  hue: number;
  badgeBg: string;
}

function hueColor(hue: number) {
  return `oklch(0.55 0.15 ${hue})`;
}

export const COASTER_STYLES: Record<ItemSlug, CoasterStyle> = {
  "tradition-1": { mono: "T1", hue: 30, badgeBg: hueColor(30) },
  "tradition-2": { mono: "T2", hue: 200, badgeBg: hueColor(200) },
  "tradition-3": { mono: "T3", hue: 340, badgeBg: hueColor(340) },
};
