// The 9 coasters are 3 independent braai phrases per language, not one
// concept translated 3 ways — so language is the grouping unit (collect all
// 3 in a language to complete that set), not a shared item across languages.
export const LANGUAGE_ORDER = ["ZU", "XH", "AF"] as const;

export type LanguageCode = (typeof LANGUAGE_ORDER)[number];

export const LANGUAGE_INFO: Record<LanguageCode, { label: string; slug: string }> = {
  ZU: { label: "Zulu", slug: "zulu" },
  XH: { label: "Xhosa", slug: "xhosa" },
  AF: { label: "Afrikaans", slug: "afrikaans" },
};

export function languageSlugToCode(slug: string): LanguageCode | undefined {
  return LANGUAGE_ORDER.find((code) => LANGUAGE_INFO[code].slug === slug);
}

export const COASTERS_PER_LANGUAGE = 3;

export const TOTAL_CARDS = LANGUAGE_ORDER.length * COASTERS_PER_LANGUAGE;

export interface Retailer {
  name: string;
  suburb: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
}

// Static seed data — swap for a live store-locator feed later if needed.
export const RETAILERS: Retailer[] = [
  {
    name: "Weber Specialist Store",
    suburb: "Sandton",
    city: "Johannesburg",
    address: "Nelson Mandela Square, Sandton, 2196",
    phone: "011 883 0000",
    hours: "Mon–Sat 09:00–18:00, Sun 09:00–15:00",
  },
  {
    name: "Weber Specialist Store",
    suburb: "V&A Waterfront",
    city: "Cape Town",
    address: "Dock Rd, V&A Waterfront, 8001",
    phone: "021 418 0000",
    hours: "Mon–Sat 09:00–19:00, Sun 09:00–17:00",
  },
  {
    name: "Weber Specialist Store",
    suburb: "Gateway",
    city: "Umhlanga, Durban",
    address: "1 Palm Blvd, Umhlanga Ridge, 4319",
    phone: "031 566 0000",
    hours: "Mon–Sun 09:00–18:00",
  },
  {
    name: "Builders Warehouse",
    suburb: "Menlyn",
    city: "Pretoria",
    address: "Cnr Lois & Atterbury Rd, Menlyn, 0181",
    phone: "012 348 0000",
    hours: "Mon–Sat 07:00–18:00, Sun 08:00–16:00",
  },
  {
    name: "Game",
    suburb: "Tygervalley",
    city: "Cape Town",
    address: "Willie van Schoor Ave, Tygervalley, 7530",
    phone: "021 943 0000",
    hours: "Mon–Sun 09:00–19:00",
  },
  {
    name: "Makro",
    suburb: "Woodmead",
    city: "Johannesburg",
    address: "Van Reenens Ave, Woodmead, 2191",
    phone: "011 555 0000",
    hours: "Mon–Sun 09:00–18:00",
  },
];
