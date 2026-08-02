import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHallOfFame } from "@/lib/supabase/queries";

export default async function HallOfFamePage() {
  const supabase = await createClient();
  const winners = await getHallOfFame(supabase);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Challenge
      </Link>

      <h1 className="font-heading text-xl font-bold uppercase tracking-tight">
        Hall of Fame
      </h1>

      {winners.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <Trophy className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No challenges have closed yet — the first winner will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {winners.map((win) => (
            <div
              key={win.challenge_id}
              className="flex gap-3 border-b border-border py-3.5 last:border-b-0"
            >
              <div className="relative size-[52px] shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={win.image_url}
                  alt={win.caption ?? "Winning braai photo"}
                  fill
                  className="object-cover"
                  sizes="52px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {new Date(win.ends_at).toLocaleDateString("en-ZA", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="my-0.5 text-sm font-semibold text-foreground">
                  {win.display_name || "Braai Fan"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {win.caption || win.theme}
                </p>
                <p className="mt-1 font-heading text-[11px] tracking-wide text-primary">
                  WEBER-BRAAI-••••
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
