import type { SupabaseClient } from "@supabase/supabase-js";
import { subHours, subDays } from "date-fns";
import type { Database, Card, PostWithVotes } from "@/lib/database.types";

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
// FEATURE 2 — BRAAI FEED
// ============================================================================

export const FEED_WINDOWS = ["today", "week", "month", "all"] as const;
export type FeedWindow = (typeof FEED_WINDOWS)[number];

function windowCutoff(window: FeedWindow): string | null {
  const now = new Date();
  switch (window) {
    case "today":
      return subHours(now, 24).toISOString();
    case "week":
      return subDays(now, 7).toISOString();
    case "month":
      return subDays(now, 30).toISOString();
    case "all":
      return null;
  }
}

export interface FeedPost extends PostWithVotes {
  hasVoted: boolean;
}

// Ranking (vote count within the window) is done in the query itself via the
// posts_with_votes view + an order-by, not by pulling every vote row client-side.
export async function getFeedPosts(
  supabase: TypedClient,
  window: FeedWindow,
  userId: string | null
): Promise<FeedPost[]> {
  let query = supabase
    .from("posts_with_votes")
    .select("*")
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: false });

  const cutoff = windowCutoff(window);
  if (cutoff) {
    query = query.gte("created_at", cutoff);
  }

  const { data: posts, error } = await query;
  if (error) throw error;

  if (!userId || posts.length === 0) {
    return posts.map((post) => ({ ...post, hasVoted: false }));
  }

  const { data: userVotes, error: votesError } = await supabase
    .from("votes")
    .select("post_id")
    .eq("user_id", userId)
    .in(
      "post_id",
      posts.map((post) => post.id)
    );

  if (votesError) throw votesError;

  const votedPostIds = new Set(userVotes.map((vote) => vote.post_id));
  return posts.map((post) => ({
    ...post,
    hasVoted: votedPostIds.has(post.id),
  }));
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

export async function createPost(
  supabase: TypedClient,
  userId: string,
  imageUrl: string,
  caption: string
): Promise<void> {
  const { error } = await supabase
    .from("posts")
    .insert({ user_id: userId, image_url: imageUrl, caption: caption || null });
  if (error) throw error;
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
