import type { ItemSlug } from "@/lib/constants";

// Per-item coaster styling — monogram + rim/badge color shown on the
// coaster face before it's flipped, matching the physical coaster concept
// (cork back, item-colored rim) instead of a generic rectangular card.
export interface CoasterStyle {
  mono: string;
  badgeBg: string;
}

export const COASTER_STYLES: Record<ItemSlug, CoasterStyle> = {
  charcoal: { mono: "CH", badgeBg: "#8a5a3a" },
  kettle: { mono: "KE", badgeBg: "#0c0c0c" },
  tongs: { mono: "TO", badgeBg: "#5a5a5a" },
  apron: { mono: "AP", badgeBg: "#3a5a4a" },
  "chimney-starter": { mono: "CS", badgeBg: "#d8291d" },
};
