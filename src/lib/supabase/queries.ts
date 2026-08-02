import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Card,
  Challenge,
  PostWithVotes,
  HallOfFameEntry,
} from "@/lib/database.types";

type TypedClient = SupabaseClient<Database>;

// ============================================================================
// FEATURE 1 — CARD COLLECTION
// ============================================================================

export async function getAllCards(supabase: TypedClient): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("item_slug", { ascending: true })
    .order("language_code", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCollectedCardIds(
  supabase: TypedClient,
  userId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("user_collections")
    .select("card_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set(data.map((row) => row.card_id));
}

export interface ItemProgress {
  itemSlug: string;
  itemName: string;
  collected: number;
  total: number;
}

// Groups all 25 cards by item and cross-references against what this user
// has collected, in a single pass — avoids a round trip per item.
export function summarizeByItem(
  cards: Card[],
  collectedIds: Set<string>
): ItemProgress[] {
  const byItem = new Map<string, ItemProgress>();

  for (const card of cards) {
    const existing = byItem.get(card.item_slug);
    const isCollected = collectedIds.has(card.id);
    if (existing) {
      existing.total += 1;
      if (isCollected) existing.collected += 1;
    } else {
      byItem.set(card.item_slug, {
        itemSlug: card.item_slug,
        itemName: card.item_name,
        total: 1,
        collected: isCollected ? 1 : 0,
      });
    }
  }

  return Array.from(byItem.values());
}

export async function getCardById(
  supabase: TypedClient,
  cardId: string
): Promise<Card | null> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", cardId.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type CollectCardResult =
  | { status: "collected" }
  | { status: "already_collected" }
  | { status: "not_found" };

export async function collectCard(
  supabase: TypedClient,
  userId: string,
  cardId: string
): Promise<CollectCardResult> {
  const card = await getCardById(supabase, cardId);
  if (!card) return { status: "not_found" };

  const { error } = await supabase
    .from("user_collections")
    .insert({ user_id: userId, card_id: card.id });

  if (error) {
    // unique_violation on (user_id, card_id) means it's already in the collection
    if (error.code === "23505") return { status: "already_collected" };
    throw error;
  }

  return { status: "collected" };
}

// ============================================================================
// FEATURE 2 — MONTHLY BRAAI CHALLENGE
// ============================================================================

// Lazily closes the active challenge if its window has elapsed (picks the
// winner + mints their voucher) — see close_challenge_if_due() in
// supabase/schema.sql. Cheap no-op when nothing is due; safe to call on
// every page load instead of running a real cron/scheduler.
export async function closeChallengeIfDue(supabase: TypedClient): Promise<void> {
  const { error } = await supabase.rpc("close_challenge_if_due");
  if (error) throw error;
}

export async function getActiveChallenge(
  supabase: TypedClient
): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export interface LeaderboardEntry extends PostWithVotes {
  hasVoted: boolean;
  rank: number;
}

// Ranking (vote count) is done in the query itself via the posts_with_votes
// view + an order-by, not by pulling every vote row client-side.
export async function getLeaderboard(
  supabase: TypedClient,
  challengeId: string,
  userId: string | null
): Promise<LeaderboardEntry[]> {
  const { data: posts, error } = await supabase
    .from("posts_with_votes")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  let votedPostIds = new Set<string>();
  if (userId && posts.length > 0) {
    const { data: userVotes, error: votesError } = await supabase
      .from("votes")
      .select("post_id")
      .eq("user_id", userId)
      .in(
        "post_id",
        posts.map((post) => post.id)
      );
    if (votesError) throw votesError;
    votedPostIds = new Set(userVotes.map((vote) => vote.post_id));
  }

  return posts.map((post, index) => ({
    ...post,
    hasVoted: votedPostIds.has(post.id),
    rank: index + 1,
  }));
}

export async function submitChallengeEntry(
  supabase: TypedClient,
  userId: string,
  challengeId: string,
  imageUrl: string,
  caption: string,
  displayName: string
): Promise<void> {
  const { error } = await supabase.from("posts").upsert(
    {
      user_id: userId,
      challenge_id: challengeId,
      image_url: imageUrl,
      caption: caption || null,
      display_name: displayName || "Braai Fan",
    },
    { onConflict: "challenge_id,user_id" }
  );
  if (error) throw error;
}

export interface MyVoucher {
  code: string;
  challengeTheme: string;
  createdAt: string;
}

export async function getMyLatestVoucher(
  supabase: TypedClient,
  userId: string
): Promise<MyVoucher | null> {
  const { data: voucher, error } = await supabase
    .from("voucher_codes")
    .select("code, created_at, challenge_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!voucher) return null;

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("theme")
    .eq("id", voucher.challenge_id)
    .maybeSingle();
  if (challengeError) throw challengeError;

  return {
    code: voucher.code,
    createdAt: voucher.created_at,
    challengeTheme: challenge?.theme ?? "",
  };
}

export async function getHallOfFame(
  supabase: TypedClient
): Promise<HallOfFameEntry[]> {
  const { data, error } = await supabase
    .from("hall_of_fame")
    .select("*")
    .order("ends_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function toggleVote(
  supabase: TypedClient,
  userId: string,
  postId: string,
  currentlyVoted: boolean
): Promise<void> {
  if (currentlyVoted) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("votes")
    .insert({ user_id: userId, post_id: postId });
  // unique_violation just means another tab already registered the vote — fine.
  if (error && error.code !== "23505") throw error;
}

export async function uploadBraaiPhoto(
  supabase: TypedClient,
  userId: string,
  file: File
): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("braai-photos")
    .upload(path, file);
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("braai-photos").getPublicUrl(path);

  return publicUrl;
}
