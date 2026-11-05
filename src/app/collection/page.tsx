"use client";

import Link from "next/link";
import { CARDS } from "@/lib/demo/data";
import { useDemoState } from "@/lib/demo/store";
import { LANGUAGE_ORDER, LANGUAGE_INFO, TOTAL_CARDS } from "@/lib/constants";
import { LANGUAGE_STYLES } from "@/lib/coasters";
import { PageHeader } from "@/components/page-header";

export default function CollectionPage() {
  const { collected } = useDemoState();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="Coaster Rack"
        subtitle={`${collected.length} of ${TOTAL_CARDS} coasters collected`}
        watermark
      />

      <div className="flex flex-col gap-3">
        {LANGUAGE_ORDER.map((code) => {
          const langCards = CARDS.filter((card) => card.language_code === code).sort(
            (a, b) => a.item_slug.localeCompare(b.item_slug)
          );
          const style = LANGUAGE_STYLES[code];

          return (
            <Link
              key={code}
              href={`/collection/${LANGUAGE_INFO[code].slug}`}
              className="sticker-border rounded-2xl bg-card p-4 transition-transform active:scale-[0.98]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-8 items-center justify-center rounded-[10px] font-heading text-[11px] font-semibold text-weber-black"
                    style={{ background: style.badgeBg }}
                  >
                    {code}
                  </div>
                  <p className="font-heading text-sm uppercase tracking-wide text-foreground">
                    {LANGUAGE_INFO[code].label}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">View ›</span>
              </div>

              <div className="flex gap-2">
                {langCards.map((card) => {
                  const unlocked = collected.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      className="flex h-9 flex-1 items-center justify-center rounded-[10px] px-1 text-center text-[10px] font-bold"
                      style={
                        unlocked
                          ? {
                              background: `oklch(0.55 0.15 ${style.hue} / 22%)`,
                              border: `1px solid oklch(0.55 0.15 ${style.hue} / 65%)`,
                              color: "var(--weber-black)",
                            }
                          : {
                              background: "oklch(0.22 0.02 40 / 4%)",
                              border: "1px dashed oklch(0.22 0.02 40 / 20%)",
                              color: "oklch(0.55 0.02 50)",
                            }
                      }
                    >
                      {unlocked ? card.item_name : "·"}
                    </div>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
