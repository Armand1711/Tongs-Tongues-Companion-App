"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { emberBurst } from "@/components/ember-field";

export function SetCompleteModal({
  itemSlug,
  itemName,
}: {
  itemSlug: string;
  itemName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // One-time read of an external system (localStorage) to decide whether
    // this device has already seen the reward for this item — not derivable
    // from render-time state, so an effect (not derived state) is correct here.
    const seenKey = `tt-set-complete-seen:${itemSlug}`;
    if (!localStorage.getItem(seenKey)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      localStorage.setItem(seenKey, "1");
    }
  }, [itemSlug]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) emberBurst(30);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="sticker-border flex w-full items-center justify-between rounded-2xl bg-weber-black p-[18px] text-left"
          />
        }
      >
        <div>
          <p className="font-heading text-[13px] font-semibold uppercase tracking-wide text-weber-ember">
            Set Complete
          </p>
          <p className="mt-0.5 text-xs text-weber-cream/60">
            10% off unlocked at Weber retailers
          </p>
        </div>
        <span className="text-xl text-weber-cream/60">›</span>
      </DialogTrigger>

      <DialogContent className="sticker-border rounded-2xl bg-card p-6 text-center">
        <DialogHeader className="items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground animate-glow-pulse">
            <PartyPopper className="size-8" />
          </div>
          <DialogTitle className="font-heading text-2xl uppercase tracking-tight">
            Set Complete!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            You&apos;ve collected all the language coasters for {itemName}.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-center">
          <p className="font-heading text-xl font-bold text-weber-ember">
            10% OFF
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            at any Weber retailer
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
