import Image from "next/image";
import { HALL_OF_FAME } from "@/lib/demo/data";
import { PageHeader } from "@/components/page-header";

export default function HallOfFamePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="Hall of Fame"
        subtitle="Past monthly braai challenge winners"
        back={{ href: "/feed", label: "Challenge" }}
        watermark
      />

      <div className="flex flex-col gap-3">
        {HALL_OF_FAME.map((win) => (
          <div
            key={win.challenge_id}
            className="sticker-border flex gap-3 rounded-2xl bg-card p-3.5"
          >
            <div className="relative size-[52px] shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image
                src={win.image_url}
                alt={win.caption ?? "Winning braai photo"}
                fill
                className="object-cover"
                sizes="52px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {new Date(win.ends_at).toLocaleDateString("en-ZA", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="my-0.5 text-sm font-semibold text-foreground">
                {win.display_name || "Braai Fan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {win.caption || win.theme}
              </p>
              <p className="mt-1 font-heading text-[11px] tracking-wide text-primary">
                WEBER-BRAAI-••••
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
