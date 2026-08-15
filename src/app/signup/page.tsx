import { BookmarkCheck, Trophy, Smartphone } from "lucide-react";
import { SignupForm } from "@/components/signup-form";
import { PageHeader } from "@/components/page-header";

const BENEFITS = [
  {
    icon: BookmarkCheck,
    text: "Everything you've collected so far — coasters, entries, comments, votes — moves with you. Nothing resets.",
  },
  {
    icon: Trophy,
    text: "Your challenge entries carry your name, so you can actually claim the win.",
  },
  {
    icon: Smartphone,
    text: "Pick up your rack and history on any device, not just this one.",
  },
];

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="Create Account"
        subtitle="Takes 20 seconds — your guest progress on this device comes with you."
        back={{ href: "/account", label: "Account" }}
      />

      <div className="flex flex-col gap-2.5">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <span className="btn-sticker flex size-8 shrink-0 items-center justify-center rounded-full bg-weber-black text-weber-cream">
              <Icon className="size-4" />
            </span>
            <p className="pt-1 text-[13px] text-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="sticker-border rounded-2xl bg-card p-5">
        <SignupForm />
      </div>
    </div>
  );
}
