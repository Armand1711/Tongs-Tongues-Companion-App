"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { addComment } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const bodySchema = z
  .string()
  .trim()
  .min(1, "Write something before posting.")
  .max(1000, "Keep comments under 1000 characters.");
const nameSchema = z.string().max(60, "Keep your name under 60 characters.");

export function CommentForm({ postId }: { postId: string }) {
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const bodyResult = bodySchema.safeParse(body);
    if (!bodyResult.success) {
      toast.error(bodyResult.error.issues[0].message);
      return;
    }
    const nameResult = nameSchema.safeParse(displayName);
    if (!nameResult.success) {
      toast.error(nameResult.error.issues[0].message);
      return;
    }

    addComment(postId, nameResult.data.trim(), bodyResult.data);
    setBody("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="commentName">Your name (optional)</Label>
        <Input
          id="commentName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Braai Fan"
          maxLength={60}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="commentBody">Comment</Label>
        <Textarea
          id="commentBody"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What do you think?"
          maxLength={1000}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="btn-sticker self-end rounded-xl bg-primary font-heading text-xs font-bold uppercase tracking-wide text-primary-foreground"
      >
        Post Comment
      </Button>
    </form>
  );
}
