import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card as CardData } from "@/lib/database.types";

export function LanguageCard({
  card,
  unlocked,
}: {
  card: CardData;
  unlocked: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border p-5 shadow-sm",
        unlocked
          ? "border-border bg-card"
          : "border-border/60 bg-muted/40"
      )}
    >
      <span
        className={cn(
          "font-heading text-xs uppercase tracking-wide",
          unlocked ? "text-primary" : "text-muted-foreground"
        )}
      >
        {card.language}
      </span>

      {unlocked ? (
        <div className="mt-3">
          <p className="font-heading text-2xl uppercase tracking-tight">
            {card.word}
          </p>
          <p className="mt-1 text-sm italic text-muted-foreground">
            {card.phonetic}
          </p>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-muted-foreground">
          <Lock className="size-4" />
          <p className="text-sm">Scan this card to unlock</p>
        </div>
      )}
    </div>
  );
}
