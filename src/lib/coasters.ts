import type { ItemSlug } from "@/lib/constants";

// Per-item coaster styling — monogram + rim/badge color shown on the
// coaster face before it's flipped, matching the physical coaster concept
// (cork back, item-colored rim) instead of a generic rectangular card.
// Hues match the ember-charcoal palette's per-item accent (oklch hue angle).
export interface CoasterStyle {
  mono: string;
  hue: number;
  badgeBg: string;
}

function hueColor(hue: number) {
  return `oklch(0.55 0.15 ${hue})`;
}

export const COASTER_STYLES: Record<ItemSlug, CoasterStyle> = {
  charcoal: { mono: "CH", hue: 30, badgeBg: hueColor(30) },
  kettle: { mono: "KE", hue: 200, badgeBg: hueColor(200) },
  tongs: { mono: "TO", hue: 280, badgeBg: hueColor(280) },
  apron: { mono: "AP", hue: 340, badgeBg: hueColor(340) },
  "chimney-starter": { mono: "CS", hue: 100, badgeBg: hueColor(100) },
};
