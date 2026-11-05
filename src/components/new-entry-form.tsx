"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { withBasePath } from "@/lib/demo/data";
import { submitEntry } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const captionSchema = z.string().max(280, "Keep it under 280 characters.");
const nameSchema = z.string().max(60, "Keep your name under 60 characters.");

const SAMPLE_IMAGE = withBasePath("/demo/winner-tongs.svg");
const MAX_IMAGE_SIZE = 1000;

// Shrinks the photo so it fits in localStorage, which holds only a few MB.
async function photoToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.8);
}

export function NewEntryForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [caption, setCaption] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setProcessing(true);
    try {
      setImageUrl(await photoToDataUrl(selected));
    } catch {
      toast.error("Couldn't read that image — try a JPG or PNG.");
    } finally {
      setProcessing(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!imageUrl) {
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

    submitEntry({
      imageUrl,
      caption: captionResult.data.trim(),
      displayName: nameResult.data.trim(),
    });
    toast.success("Entry submitted!");
    router.push("/feed");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
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
          {imageUrl ? (
            // Local image data, so there's nothing for next/image to optimize.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Selected braai photo"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {processing ? (
                <Loader2 className="size-8 animate-spin" />
              ) : (
                <ImagePlus className="size-8" />
              )}
              <span className="text-sm font-medium">Tap to add photo</span>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={() => setImageUrl(SAMPLE_IMAGE)}
          className="self-center text-xs font-semibold text-primary"
        >
          No photo handy? Use a sample image
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
        disabled={processing}
        size="lg"
        className="btn-sticker h-14 rounded-2xl bg-primary text-base font-heading uppercase tracking-wide text-primary-foreground"
      >
        Submit Entry
      </Button>
    </form>
  );
}
