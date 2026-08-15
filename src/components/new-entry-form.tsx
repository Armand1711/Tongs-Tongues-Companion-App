"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createClient, ensureUser } from "@/lib/supabase/client";
import { submitChallengeEntry, uploadBraaiPhoto } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const captionSchema = z.string().max(280, "Keep it under 280 characters.");
const nameSchema = z.string().max(60, "Keep your name under 60 characters.");

export function NewEntryForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Prefill from the account's saved name (set at signup) so signed-in
    // users don't have to retype it on every entry — guests still get a
    // blank field since they haven't set one.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const savedName = user?.user_metadata?.display_name;
      if (savedName) setDisplayName(savedName);
    });
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!file) {
      toast.error("Add a photo of your coaster in action first.");
      return;
    }

    const captionResult = captionSchema.safeParse(caption);
    if (!captionResult.success) {
      toast.error(captionResult.error.issues[0].message);
      return;
    }
    const nameResult = nameSchema.safeParse(displayName);
    if (!nameResult.success) {
      toast.error(nameResult.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const user = await ensureUser(supabase);

      if (!user) {
        toast.error("Couldn't start a session — check your connection and try again.");
        return;
      }

      const imageUrl = await uploadBraaiPhoto(supabase, user.id, file);
      await submitChallengeEntry(
        supabase,
        user.id,
        challengeId,
        imageUrl,
        captionResult.data.trim(),
        nameResult.data.trim()
      );

      toast.success("Entry submitted!");
      router.push("/feed");
      router.refresh();
    } catch {
      toast.error("Couldn't submit your entry — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-weber-black/25 bg-card"
        >
          {previewUrl ? (
            // local blob: preview URL — next/image's optimizer can't fetch it
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected braai photo"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImagePlus className="size-8" />
              <span className="text-sm font-medium">Tap to add photo</span>
            </div>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">Your name (optional)</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Braai Fan"
          maxLength={60}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="caption">Caption (optional)</Label>
        <Input
          id="caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Sunday braai with the family..."
          maxLength={280}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="btn-sticker h-14 rounded-2xl bg-primary text-base font-heading uppercase tracking-wide text-primary-foreground"
      >
        {submitting && <Loader2 className="size-5 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Entry"}
      </Button>
    </form>
  );
}
