import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveChallenge } from "@/lib/supabase/queries";
import { NewEntryForm } from "@/components/new-entry-form";

export default async function NewEntryPage() {
  const supabase = await createClient();
  const challenge = await getActiveChallenge(supabase);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Challenge
      </Link>

      <header className="space-y-3">
        <h1 className="font-heading text-xl font-bold uppercase tracking-tight">
          Your Entry
        </h1>
        {challenge && (
          <p className="rounded-xl border border-border bg-card px-3 py-3 text-xs text-muted-foreground">
            {challenge.theme}
          </p>
        )}
      </header>

      {challenge ? (
        <NewEntryForm challengeId={challenge.id} />
      ) : (
        <p className="text-sm text-muted-foreground">
          There&apos;s no active challenge to enter right now — check back soon.
        </p>
      )}
    </div>
  );
}
