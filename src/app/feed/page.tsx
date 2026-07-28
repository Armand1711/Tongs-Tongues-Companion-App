import Link from "next/link";
import { Plus, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFeedPosts, FEED_WINDOWS, type FeedWindow } from "@/lib/supabase/queries";
import { FeedTabs } from "@/components/feed-tabs";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";

function parseWindow(value: string | undefined): FeedWindow {
  return (FEED_WINDOWS as readonly string[]).includes(value ?? "")
    ? (value as FeedWindow)
    : "today";
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const { window: windowParam } = await searchParams;
  const window = parseWindow(windowParam);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await getFeedPosts(supabase, window, user?.id ?? null);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Braai Feed</p>
          <h1 className="font-heading text-3xl uppercase tracking-tight">
            Share the Fire
          </h1>
        </div>
        <Button
          render={<Link href="/feed/new" />}
          nativeButton={false}
          size="icon-lg"
          className="rounded-xl"
          aria-label="New post"
        >
          <Plus className="size-5" />
        </Button>
      </header>

      <FeedTabs active={window} />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <Flame className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No braai posts yet for this period. Be the first to share yours.
          </p>
          <Button
            render={<Link href="/feed/new" />}
            nativeButton={false}
            className="rounded-xl"
          >
            Post Your Braai
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} userId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
