"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { toggleVote } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

export function VoteButton({
  postId,
  userId,
  initialVoted,
  initialVoteCount,
  size = "default",
}: {
  postId: string;
  userId: string | null;
  initialVoted: boolean;
  initialVoteCount: number;
  size?: "default" | "lg";
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isPending, startTransition] = useTransition();

  function handleToggleVote() {
    if (!userId || isPending) return;

    const nextVoted = !voted;
    setVoted(nextVoted);
    setVoteCount((count) => count + (nextVoted ? 1 : -1));

    startTransition(async () => {
      try {
        const supabase = createClient();
        await toggleVote(supabase, userId, postId, voted);
      } catch {
        setVoted(voted);
        setVoteCount((count) => count + (nextVoted ? -1 : 1));
        toast.error("Couldn't register your vote — try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggleVote}
      disabled={!userId}
      aria-pressed={voted}
      className={cn(
        "flex shrink-0 flex-col items-center gap-0.5 rounded-xl font-semibold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-50",
        size === "lg" ? "px-3.5 py-2.5 text-xs" : "px-2.5 py-2 text-[11px]",
        voted ? "scale-[1.08] bg-primary/20 text-weber-ember" : "scale-100 bg-muted text-foreground"
      )}
    >
      <span className={size === "lg" ? "text-xl leading-none" : "text-base leading-none"}>
        🔥
      </span>
      {voteCount}
    </button>
  );
}
