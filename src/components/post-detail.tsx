"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getComments, getLeaderboard, useDemoState } from "@/lib/demo/store";
import { VoteButton } from "@/components/vote-button";
import { CommentForm } from "@/components/comment-form";
import { PageHeader } from "@/components/page-header";

export function PostDetail({ id }: { id: string }) {
  const state = useDemoState();
  const post = getLeaderboard(state).find((entry) => entry.id === id);

  if (!post) {
    // The visitor's own entry page exists before they've entered, or after a reset.
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 pt-16 text-center">
        <p className="text-sm text-muted-foreground">
          You haven&apos;t entered this month&apos;s challenge yet.
        </p>
        <Link href="/feed/new" className="text-sm font-semibold text-primary">
          Enter the Challenge
        </Link>
      </div>
    );
  }

  const comments = getComments(state, id);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-8">
      <PageHeader title="Braai Post" back={{ href: "/feed", label: "Challenge" }} />

      <div className="sticker-border overflow-hidden rounded-3xl bg-card">
        <div className="relative aspect-square w-full bg-muted">
          <Image
            src={post.image_url}
            alt={post.caption ?? "Braai photo"}
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {post.display_name || "Braai Fan"}
            </p>
            <p className="text-xs text-muted-foreground">
              {post.caption || "No caption"}
            </p>
          </div>
          <VoteButton
            postId={post.id}
            voted={post.hasVoted}
            voteCount={post.vote_count}
            size="lg"
          />
        </div>
      </div>

      <section className="flex flex-col gap-4 pb-8">
        <h2 className="flex items-center gap-1.5 font-heading text-[13px] uppercase tracking-wide text-foreground">
          <MessageCircle className="size-4" />
          Comments ({comments.length})
        </h2>

        <CommentForm postId={post.id} />

        {comments.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-weber-black/20 p-6 text-center text-sm text-muted-foreground">
            No comments yet — be the first to say something.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-2xl border-2 border-weber-black/10 bg-card p-3.5"
              >
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {comment.display_name || "Braai Fan"}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="shrink-0 text-[11px] text-muted-foreground"
                  >
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground/90">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
