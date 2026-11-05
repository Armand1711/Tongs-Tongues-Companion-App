import { Flame } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ResetDemoButton } from "@/components/reset-demo-button";

const FEATURES = [
  "Scan QR codes on physical coasters to collect braai phrases in Zulu, Xhosa and Afrikaans",
  "Finish a language set to unlock a reward",
  "Enter a monthly braai challenge, vote on entries and comment on them",
  "The top entry wins a voucher and a place in the Hall of Fame",
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="About This Project"
        subtitle="A companion app for the Tongs & Tongues braai campaign."
        back={{ href: "/", label: "Home" }}
        watermark
      />

      <section className="sticker-border flex flex-col gap-3 rounded-2xl bg-card p-5">
        <h2 className="font-heading text-sm uppercase tracking-wide text-foreground">
          What it does
        </h2>
        <ul className="flex flex-col gap-2.5">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm text-foreground/90">
              <Flame className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sticker-border flex flex-col gap-3 rounded-2xl bg-card p-5">
        <h2 className="font-heading text-sm uppercase tracking-wide text-foreground">
          About this demo
        </h2>
        <p className="text-sm text-foreground/90">
          No account needed. The people, entries, stores and voucher codes are
          sample content, and vouchers can&apos;t be redeemed.
        </p>
        <p className="text-sm text-foreground/90">
          Anything you do, including photos you add, stays in this browser and
          is never uploaded.
        </p>
        <ResetDemoButton />
      </section>

      <section className="sticker-border flex flex-col gap-3 rounded-2xl bg-card p-5">
        <h2 className="font-heading text-sm uppercase tracking-wide text-foreground">
          Built with
        </h2>
        <p className="text-sm text-foreground/90">
          Next.js, React, TypeScript and Tailwind CSS. The full version used
          Supabase for accounts, the database and photo storage. This demo runs
          as a static site on GitHub Pages.
        </p>
        <a
          href="https://github.com/Armand1711/Tongs-Tongues-Companion-App"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-primary"
        >
          View the code on GitHub →
        </a>
      </section>
    </div>
  );
}
