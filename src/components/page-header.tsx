import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FlameGraphic } from "@/components/flame-graphic";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  back,
  align = "left",
  watermark = false,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  align?: "left" | "center";
  watermark?: boolean;
}) {
  return (
    <header
      className={cn(
        "relative flex flex-col gap-3",
        align === "center" && "items-center text-center"
      )}
    >
      {watermark && (
        <FlameGraphic className="pointer-events-none absolute -top-6 right-0 h-24 w-24 text-primary/[0.06]" />
      )}
      {back && (
        <Link
          href={back.href}
          className="sticker-border relative inline-flex w-fit items-center gap-1 rounded-full bg-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground transition-transform active:scale-95"
        >
          <ChevronLeft className="size-3.5" />
          {back.label}
        </Link>
      )}
      <div className="relative">
        <h1 className="font-heading text-2xl uppercase tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
