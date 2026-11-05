import { useSyncExternalStore } from "react";
import type { Card, Comment, PostWithVotes } from "@/lib/database.types";
import {
  CARDS,
  CHALLENGE,
  COMMENTS,
  DEMO_USER_ID,
  INITIAL_COLLECTED,
  MY_ENTRY_ID,
  POSTS,
} from "@/lib/demo/data";

// Per-visitor state, kept in localStorage instead of a database. Nothing a
// visitor does leaves their browser.

const STORAGE_KEY = "tt-demo-state-v1";
const SEEN_KEY_PREFIXES = ["tt-set-complete-seen:", "tt-voucher-seen:"];

export interface MyEntry {
  imageUrl: string;
  caption: string;
  displayName: string;
  createdAt: string;
}

export interface DemoState {
  collected: string[];
  votes: string[];
  myEntry: MyEntry | null;
  comments: Comment[];
}

const INITIAL_STATE: DemoState = {
  collected: INITIAL_COLLECTED,
  votes: [],
  myEntry: null,
  comments: [],
};

let state: DemoState | null = null;
const listeners = new Set<() => void>();

function getState(): DemoState {
  if (state) return state;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    state = saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
  } catch {
    state = INITIAL_STATE;
  }
  return state!;
}

function setState(next: DemoState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage is full or blocked: the change still lasts until the page reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDemoState() {
  return useSyncExternalStore(subscribe, getState, () => INITIAL_STATE);
}

export function resetDemo() {
  try {
    Object.keys(localStorage)
      .filter((key) => SEEN_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage is blocked, so there is nothing saved to clear.
  }
  setState(INITIAL_STATE);
}

// ---------------------------------------------------------------------------
// Coasters
// ---------------------------------------------------------------------------

export function getCardById(cardId: string): Card | undefined {
  return CARDS.find((card) => card.id === cardId.toUpperCase());
}

export function collectCard(cardId: string): "collected" | "already_collected" {
  const current = getState();
  if (current.collected.includes(cardId)) return "already_collected";
  setState({ ...current, collected: [...current.collected, cardId] });
  return "collected";
}

export interface LanguageProgress {
  languageCode: string;
  language: string;
  collected: number;
  total: number;
}

export function summarizeByLanguage(collected: string[]): LanguageProgress[] {
  const byLanguage = new Map<string, LanguageProgress>();

  for (const card of CARDS) {
    const progress = byLanguage.get(card.language_code) ?? {
      languageCode: card.language_code,
      language: card.language,
      collected: 0,
      total: 0,
    };
    progress.total += 1;
    if (collected.includes(card.id)) progress.collected += 1;
    byLanguage.set(card.language_code, progress);
  }

  return Array.from(byLanguage.values());
}

// ---------------------------------------------------------------------------
// Challenge
// ---------------------------------------------------------------------------

export interface LeaderboardEntry extends PostWithVotes {
  hasVoted: boolean;
  rank: number;
}

function myEntryAsPost(entry: MyEntry): PostWithVotes {
  return {
    id: MY_ENTRY_ID,
    user_id: DEMO_USER_ID,
    image_url: entry.imageUrl,
    caption: entry.caption || null,
    display_name: entry.displayName || null,
    challenge_id: CHALLENGE.id,
    created_at: entry.createdAt,
    vote_count: 0,
  };
}

export function getLeaderboard({ myEntry, votes }: DemoState): LeaderboardEntry[] {
  const posts = myEntry ? [...POSTS, myEntryAsPost(myEntry)] : POSTS;

  return posts
    .map((post) => {
      const hasVoted = votes.includes(post.id);
      return { ...post, hasVoted, vote_count: post.vote_count + (hasVoted ? 1 : 0) };
    })
    .sort(
      (a, b) =>
        b.vote_count - a.vote_count || a.created_at.localeCompare(b.created_at)
    )
    .map((post, index) => ({ ...post, rank: index + 1 }));
}

export function toggleVote(postId: string) {
  const current = getState();
  setState({
    ...current,
    votes: current.votes.includes(postId)
      ? current.votes.filter((id) => id !== postId)
      : [...current.votes, postId],
  });
}

export function submitEntry(entry: Omit<MyEntry, "createdAt">) {
  setState({
    ...getState(),
    myEntry: { ...entry, createdAt: new Date().toISOString() },
  });
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export function getComments({ comments }: DemoState, postId: string): Comment[] {
  return [...COMMENTS, ...comments]
    .filter((comment) => comment.post_id === postId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function addComment(postId: string, displayName: string, body: string) {
  const current = getState();
  const createdAt = new Date().toISOString();
  setState({
    ...current,
    comments: [
      ...current.comments,
      {
        id: `${DEMO_USER_ID}-${createdAt}`,
        post_id: postId,
        user_id: DEMO_USER_ID,
        display_name: displayName || null,
        body,
        created_at: createdAt,
      },
    ],
  });
}
