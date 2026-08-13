import { createClient } from "@/lib/supabase/server";
import { getActiveChallenge } from "@/lib/supabase/queries";
import { NewEntryForm } from "@/components/new-entry-form";
import { PageHeader } from "@/components/page-header";

export default async function NewEntryPage() {
  const supabase = await createClient();
  const challenge = await getActiveChallenge(supabase);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader title="Your Entry" back={{ href: "/feed", label: "Challenge" }} />

      {challenge && (
        <p className="sticker-border inline-block w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          🔥 {challenge.theme}
        </p>
      )}

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
