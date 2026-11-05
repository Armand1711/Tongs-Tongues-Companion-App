import type {
  Card,
  Challenge,
  Comment,
  HallOfFameEntry,
  PostWithVotes,
} from "@/lib/database.types";

// Sample content for the portfolio demo. Replaces the Supabase backend, so the
// whole app can run as a static site with no login.

// next/image and plain <img> don't add the base path to public assets.
export function withBasePath(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

export const DEMO_USER_ID = "demo-visitor";
// There is one entry per visitor, so one pre-rendered page can show it.
export const MY_ENTRY_ID = "my-entry";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function ago(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

const CARD_CREATED_AT = "2026-08-01T12:00:00Z";

function card(
  id: string,
  item_name: string,
  item_slug: string,
  language: string,
  word: string,
  phonetic: string
): Card {
  return {
    id,
    item_name,
    item_slug,
    language,
    language_code: id.slice(0, 2),
    word,
    phonetic,
    image_url: withBasePath(`/coasters/${item_slug}.jpg`),
    created_at: CARD_CREATED_AT,
  };
}

export const CARDS: Card[] = [
  card("AF-01", "Barbecue Sandwich", "afrikaans-engel-piepie", "Afrikaans", "Joh! Smaak Soos Engel Piepie!", "Whoa! Tastes like angel wee! (i.e. amazing)"),
  card("AF-02", "Braai Chicken", "afrikaans-jy-lyk-so-lekker", "Afrikaans", "Jy Lyk So Lekker", "You look so delicious"),
  card("AF-03", "Brandy & Coke", "afrikaans-koue-een", "Afrikaans", "Tyd vir 'n Koue Een!", "Time for a cold one!"),
  card("XH-01", "Steamed Bread & Beans", "xhosa-mncwaa", "Xhosa", "Mncwaa! Mncwaa!", "Nom nom! (the sound of eating with relish)"),
  card("XH-02", "Umngqusho (Samp)", "xhosa-phuma-phambili", "Xhosa", "Yho, Phuma Phambili!", "Whoa, come out on top!"),
  card("XH-03", "Pap & Tripe", "xhosa-lumnandi", "Xhosa", "Lumnandi!", "It's delicious!"),
  card("ZU-01", "Pap & Chakalaka", "zulu-kumnandi", "Zulu", "Kumnandi! Kumnandi! Kumnandi!", "It's delicious! It's delicious! It's delicious!"),
  card("ZU-02", "Sunday Plate", "zulu-kungithinta", "Zulu", "Kungithinta Ngaphakathi!", "It touches me on the inside!"),
  card("ZU-03", "Pap & Braai Meat", "zulu-iyavaya", "Zulu", "IyaVaya", "It's popping / it's going off"),
];

// The Afrikaans set starts complete so visitors can see the reward, and three
// coasters are left for them to collect on the Scan tab.
export const INITIAL_COLLECTED = ["ZU-01", "ZU-02", "XH-01", "AF-01", "AF-02", "AF-03"];

// Always the current calendar month, so the countdown never runs out.
function buildChallenge(): Challenge {
  const now = new Date();
  const startsAt = new Date(now.getFullYear(), now.getMonth(), 1);
  const endsAt = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, -1);
  return {
    id: "demo-challenge",
    theme:
      "Teach us your Kumnandi — post your braai, caption it with your coaster's phrase, and tell us what it means in English.",
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "active",
    created_at: startsAt.toISOString(),
  };
}

export const CHALLENGE = buildChallenge();

function post(
  id: string,
  display_name: string,
  caption: string,
  image: string,
  vote_count: number,
  ageInDays: number
): PostWithVotes {
  return {
    id,
    user_id: `sample-${id}`,
    image_url: withBasePath(`/demo/${image}.svg`),
    caption,
    display_name,
    challenge_id: CHALLENGE.id,
    created_at: ago(ageInDays * DAY),
    vote_count,
  };
}

export const POSTS: PostWithVotes[] = [
  post("thandi", "Thandi M.", "Kumnandi! It's delicious — pap, chakalaka and the whole family asking for seconds.", "pap-chakalaka", 42, 12),
  post("pieter", "Pieter v.d. M.", "Jy lyk so lekker — \"you look so delicious\". I said it to the chicken, I promise.", "braai-chicken", 37, 10),
  post("sipho", "Sipho N.", "IyaVaya! It's going off at ours this Sunday. The coals are perfect.", "kettle", 29, 8),
  post("lindiwe", "Lindiwe K.", "Mncwaa! Mncwaa! That's the sound of my uncle finding the steamed bread.", "steamed-bread", 18, 5),
  post("jaco", "Jaco B.", "Tyd vir 'n koue een — time for a cold one while the wors finishes.", "wors", 11, 2),
];

function comment(
  id: string,
  post_id: string,
  display_name: string,
  body: string,
  created_at: string
): Comment {
  return { id, post_id, user_id: `sample-${id}`, display_name, body, created_at };
}

export const COMMENTS: Comment[] = [
  comment("c1", "thandi", "Sipho N.", "That chakalaka looks properly hot. Recipe, please!", ago(3 * DAY)),
  comment("c2", "thandi", "Naledi P.", "Kumnandi is my new favourite word.", ago(26 * HOUR)),
  comment("c3", "pieter", "Thandi M.", "Hahaha, the chicken is blushing.", ago(2 * DAY)),
  comment("c4", "sipho", "Jaco B.", "Those are some good-looking coals, boet.", ago(4 * DAY)),
  comment("c5", "lindiwe", "Pieter v.d. M.", "Now I need to learn how to say this one properly.", ago(30 * HOUR)),
];

// The newest winner is the visitor, which is what unlocks the voucher below.
// Mid-month dates show the same month in every time zone.
export const HALL_OF_FAME: HallOfFameEntry[] = [
  {
    challenge_id: "october",
    theme: "Best braai side dish",
    ends_at: "2026-10-15T12:00:00Z",
    post_id: "october-winner",
    image_url: withBasePath("/demo/winner-tongs.svg"),
    caption: "Lumnandi! It's delicious — Gogo's recipe, my tongs.",
    display_name: "You",
    won_at: "2026-10-15T12:00:00Z",
  },
  {
    challenge_id: "september",
    theme: "Heritage Day braai",
    ends_at: "2026-09-15T12:00:00Z",
    post_id: "september-winner",
    image_url: withBasePath("/demo/kettle.svg"),
    caption: "Yho, phuma phambili! Three generations around one fire.",
    display_name: "Ayanda D.",
    won_at: "2026-09-15T12:00:00Z",
  },
  {
    challenge_id: "august",
    theme: "Winter braai heroes",
    ends_at: "2026-08-15T12:00:00Z",
    post_id: "august-winner",
    image_url: withBasePath("/demo/wors.svg"),
    caption: "Braaiing in the rain still counts.",
    display_name: "Marius L.",
    won_at: "2026-08-15T12:00:00Z",
  },
];

export const DEMO_VOUCHER = {
  code: "WEBER-BRAAI-DEMO",
  challengeTheme: HALL_OF_FAME[0].theme,
};
