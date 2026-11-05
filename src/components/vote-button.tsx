"use client";

import { toggleVote } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export function VoteButton({
  postId,
  voted,
  voteCount,
  size = "default",
}: {
  postId: string;
  voted: boolean;
  voteCount: number;
  size?: "default" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={() => toggleVote(postId)}
      aria-pressed={voted}
      aria-label={`Vote for this entry, ${voteCount} votes`}
      className={cn(
        "flex shrink-0 flex-col items-center gap-0.5 rounded-xl font-semibold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
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
