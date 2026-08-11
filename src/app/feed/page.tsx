import Link from "next/link";
import { Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  closeChallengeIfDue,
  getActiveChallenge,
  getLeaderboard,
  getMyLatestVoucher,
} from "@/lib/supabase/queries";
import { ChallengeCountdown } from "@/components/challenge-countdown";
import { LeaderboardRow } from "@/components/leaderboard-row";
import { WinnerBanner } from "@/components/winner-banner";
import { Button } from "@/components/ui/button";
import { FlameGraphic } from "@/components/flame-graphic";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await closeChallengeIfDue(supabase);

  const challenge = await getActiveChallenge(supabase);
  const [leaderboard, voucher] = await Promise.all([
    challenge ? getLeaderboard(supabase, challenge.id, user?.id ?? null) : Promise.resolve([]),
    user ? getMyLatestVoucher(supabase, user.id) : Promise.resolve(null),
  ]);

  const myEntry = user
    ? leaderboard.find((entry) => entry.user_id === user.id)
    : undefined;

  return (
    <div className="mx-auto flex max-w-md flex-col">
      {challenge ? (
        <div className="relative overflow-hidden rounded-b-3xl bg-weber-black px-5 py-6 text-weber-cream">
          <FlameGraphic className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 text-white/5" />
          <p className="relative mb-2 text-[11px] uppercase tracking-[0.12em] text-weber-cream/70">
            🔥 This Month&apos;s Challenge
          </p>
          <p className="relative mb-4 font-heading text-lg font-bold leading-snug">
            {challenge.theme}
          </p>
          <div className="relative mb-4 flex gap-2">
            <ChallengeCountdown endsAt={challenge.ends_at} />
          </div>
          <Button
            render={<Link href="/feed/new" />}
            nativeButton={false}
            className="btn-sticker relative w-full rounded-xl bg-primary font-heading text-[13px] font-bold uppercase tracking-wide text-primary-foreground"
          >
            Enter the Challenge
          </Button>
        </div>
      ) : (
        <div className="bg-weber-black px-5 py-8 text-center text-weber-cream">
          <p className="font-heading text-sm uppercase tracking-wide">
            No active challenge right now
          </p>
          <p className="mt-1 text-xs text-weber-cream/60">
            Check back soon for next month&apos;s theme.
          </p>
        </div>
      )}

      {voucher && <WinnerBanner code={voucher.code} />}

      {myEntry && (
        <div className="sticky top-0 z-[5] flex items-center justify-between border-b border-border bg-background px-5 py-2.5 text-xs">
          <span className="text-muted-foreground">Your entry</span>
          <span className="font-semibold text-foreground">
            #{myEntry.rank} · {myEntry.vote_count} 🔥
          </span>
        </div>
      )}

      <div className="px-5 pt-4 pb-2">
        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
            <Flame className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No entries yet — be the first to enter this month&apos;s challenge.
            </p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} userId={user?.id ?? null} />
          ))
        )}
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
