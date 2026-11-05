import Link from "next/link";

export function DemoBanner() {
  return (
    <Link
      href="/about"
      className="relative z-10 block bg-primary px-4 py-1.5 text-center text-[11px] font-semibold text-primary-foreground"
    >
      Portfolio demo with sample content · <span className="underline">About</span>
    </Link>
  );
}
