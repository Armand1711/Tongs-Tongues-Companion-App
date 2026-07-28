"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { createPost, uploadBraaiPhoto } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const captionSchema = z.string().max(280, "Keep it under 280 characters.");

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!file) {
      toast.error("Add a photo of your braai first.");
      return;
    }

    const captionResult = captionSchema.safeParse(caption);
    if (!captionResult.success) {
      toast.error(captionResult.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session not ready yet — try again in a moment.");
        return;
      }

      const imageUrl = await uploadBraaiPhoto(supabase, user.id, file);
      await createPost(supabase, user.id, imageUrl, captionResult.data.trim());

      toast.success("Posted to the feed!");
      router.push("/feed");
      router.refresh();
    } catch {
      toast.error("Couldn't upload your post — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Braai Feed</p>
        <h1 className="font-heading text-3xl uppercase tracking-tight">
          New Post
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40"
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
                <span className="text-sm font-medium">Add a photo</span>
              </div>
            )}
          </button>
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
          className="h-14 rounded-2xl text-base font-heading uppercase tracking-wide"
        >
          {submitting && <Loader2 className="size-5 animate-spin" />}
          {submitting ? "Posting..." : "Post to Feed"}
        </Button>
      </form>
    </div>
  );
}
