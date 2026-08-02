"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { toggleVote } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/supabase/queries";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardRow({
  entry,
  userId,
}: {
  entry: LeaderboardEntry;
  userId: string | null;
}) {
  const [voted, setVoted] = useState(entry.hasVoted);
  const [voteCount, setVoteCount] = useState(entry.vote_count);
  const [isPending, startTransition] = useTransition();

  function handleToggleVote() {
    if (!userId || isPending) return;

    const nextVoted = !voted;
    setVoted(nextVoted);
    setVoteCount((count) => count + (nextVoted ? 1 : -1));

    startTransition(async () => {
      try {
        const supabase = createClient();
        await toggleVote(supabase, userId, entry.id, voted);
      } catch {
        setVoted(voted);
        setVoteCount((count) => count + (nextVoted ? -1 : 1));
        toast.error("Couldn't register your vote — try again.");
      }
    });
  }

  const rankLabel =
    entry.rank <= 3 ? RANK_MEDALS[entry.rank - 1] : String(entry.rank);
  const rankColor =
    entry.rank === 1 ? "text-primary" : entry.rank <= 3 ? "text-[#b5651d]" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <span
        className={cn(
          "w-6 shrink-0 text-center font-heading text-sm font-bold",
          rankColor
        )}
      >
        {rankLabel}
      </span>

      <div className="relative size-[52px] shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={entry.image_url}
          alt={entry.caption ?? "Braai photo"}
          fill
          className="object-cover"
          sizes="52px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {entry.display_name || "Braai Fan"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {entry.caption || "No caption"}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggleVote}
        disabled={!userId}
        aria-pressed={voted}
        className={cn(
          "flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 text-[11px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-50",
          voted ? "scale-[1.08] bg-primary/10 text-primary" : "scale-100 bg-muted text-foreground"
        )}
      >
        <span className="text-base leading-none">🔥</span>
        {voteCount}
      </button>
    </div>
  );
}
