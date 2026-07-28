"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-2xl border-border">
        <DialogHeader className="items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PartyPopper className="size-8" />
          </div>
          <DialogTitle className="font-heading text-2xl uppercase tracking-tight">
            Set Complete!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            You&apos;ve collected all five languages for {itemName}.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-dashed border-primary bg-primary/5 p-4 text-center">
          <p className="font-heading text-xs uppercase tracking-wide text-primary">
            Reward Unlocked
          </p>
          <p className="mt-1 text-sm">
            Show this screen at any Weber retailer for 10% off your next{" "}
            {itemName.toLowerCase()} purchase.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
