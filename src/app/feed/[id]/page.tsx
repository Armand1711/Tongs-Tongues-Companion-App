import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getPostById, getComments, hasUserVoted } from "@/lib/supabase/queries";
import { VoteButton } from "@/components/vote-button";
import { CommentForm } from "@/components/comment-form";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const post = await getPostById(supabase, id);
  if (!post) notFound();

  const [comments, hasVoted] = await Promise.all([
    getComments(supabase, id),
    user ? hasUserVoted(supabase, user.id, post.id) : Promise.resolve(false),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-8">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Challenge
      </Link>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
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
            <p className="truncate text-xs text-muted-foreground">
              {post.caption || "No caption"}
            </p>
          </div>
          <VoteButton
            postId={post.id}
            userId={user?.id ?? null}
            initialVoted={hasVoted}
            initialVoteCount={post.vote_count}
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
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No comments yet — be the first to say something.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-2xl border border-border bg-card p-3.5"
              >
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {comment.display_name || "Braai Fan"}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
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
