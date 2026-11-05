"use client";

import Link from "next/link";
import { CHALLENGE, DEMO_USER_ID, DEMO_VOUCHER } from "@/lib/demo/data";
import { getLeaderboard, useDemoState } from "@/lib/demo/store";
import { ChallengeCountdown } from "@/components/challenge-countdown";
import { LeaderboardRow } from "@/components/leaderboard-row";
import { WinnerBanner } from "@/components/winner-banner";
import { Button } from "@/components/ui/button";
import { FlameGraphic } from "@/components/flame-graphic";

export default function FeedPage() {
  const state = useDemoState();
  const leaderboard = getLeaderboard(state);
  const myEntry = leaderboard.find((entry) => entry.user_id === DEMO_USER_ID);

  return (
    <div className="mx-auto flex max-w-md flex-col">
      <div className="relative overflow-hidden rounded-b-3xl bg-weber-black px-5 py-6 text-weber-cream">
        <FlameGraphic className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 text-white/5" />
        <p className="relative mb-2 text-[11px] uppercase tracking-[0.12em] text-weber-cream/70">
          🔥 This Month&apos;s Challenge
        </p>
        <p className="relative mb-4 font-heading text-lg font-bold leading-snug">
          {CHALLENGE.theme}
        </p>
        <div className="relative mb-4 flex gap-2">
          <ChallengeCountdown endsAt={CHALLENGE.ends_at} />
        </div>
        <Button
          render={<Link href="/feed/new" />}
          nativeButton={false}
          className="btn-sticker relative w-full rounded-xl bg-primary font-heading text-[13px] font-bold uppercase tracking-wide text-primary-foreground"
        >
          {myEntry ? "Update Your Entry" : "Enter the Challenge"}
        </Button>
      </div>

      <WinnerBanner code={DEMO_VOUCHER.code} />

      {myEntry && (
        <div className="sticky top-0 z-[5] flex items-center justify-between border-b border-border bg-background px-5 py-2.5 text-xs">
          <span className="text-muted-foreground">Your entry</span>
          <span className="font-semibold text-foreground">
            #{myEntry.rank} · {myEntry.vote_count} 🔥
          </span>
        </div>
      )}

      <div className="px-5 pt-4 pb-2">
        {leaderboard.map((entry) => (
          <LeaderboardRow key={entry.id} entry={entry} />
        ))}
      </div>

      <Link
        href="/hall-of-fame"
        className="mx-5 mt-2 mb-6 text-center text-xs font-semibold text-primary"
      >
        Hall of Fame →
      </Link>
    </div>
  );
}
