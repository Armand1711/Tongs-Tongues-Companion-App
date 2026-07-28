"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { toggleVote } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/lib/supabase/queries";

export function PostCard({
  post,
  userId,
}: {
  post: FeedPost;
  userId: string | null;
}) {
  const [voted, setVoted] = useState(post.hasVoted);
  const [voteCount, setVoteCount] = useState(post.vote_count);
  const [isPending, startTransition] = useTransition();

  function handleToggleVote() {
    if (!userId || isPending) return;

    const nextVoted = !voted;
    setVoted(nextVoted);
    setVoteCount((count) => count + (nextVoted ? 1 : -1));

    startTransition(async () => {
      try {
        const supabase = createClient();
        await toggleVote(supabase, userId, post.id, voted);
      } catch {
        // roll back the optimistic update
        setVoted(voted);
        setVoteCount((count) => count + (nextVoted ? -1 : 1));
        toast.error("Couldn't register your vote — try again.");
      }
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-square w-full bg-muted">
        <Image
          src={post.image_url}
          alt={post.caption ?? "Braai photo"}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
        />
      </div>

      <div className="flex items-start justify-between gap-3 p-4">
        <p className="text-sm text-foreground">
          {post.caption || (
            <span className="text-muted-foreground">No caption</span>
          )}
        </p>

        <button
          type="button"
          onClick={handleToggleVote}
          disabled={!userId}
          aria-pressed={voted}
          className={cn(
            "flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
            voted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
          )}
        >
          <Flame className={cn("size-4", voted && "fill-current")} />
          {voteCount}
        </button>
      </div>
    </article>
  );
}
