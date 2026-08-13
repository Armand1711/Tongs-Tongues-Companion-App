import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VoteButton } from "@/components/vote-button";
import type { LeaderboardEntry } from "@/lib/supabase/queries";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardRow({
  entry,
  userId,
}: {
  entry: LeaderboardEntry;
  userId: string | null;
}) {
  const rankLabel =
    entry.rank <= 3 ? RANK_MEDALS[entry.rank - 1] : String(entry.rank);
  const rankColor =
    entry.rank === 1 ? "text-primary" : entry.rank <= 3 ? "text-weber-ember" : "text-muted-foreground";

  return (
    <div className="sticker-border mb-3 flex items-center gap-3 rounded-2xl bg-card p-3">
      <Link
        href={`/feed/${entry.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
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
      </Link>

      <VoteButton
        postId={entry.id}
        userId={userId}
        initialVoted={entry.hasVoted}
        initialVoteCount={entry.vote_count}
      />
    </div>
  );
}
