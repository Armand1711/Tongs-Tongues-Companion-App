import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Account
      </Link>

      <header className="space-y-1">
        <h1 className="font-heading text-2xl uppercase tracking-tight text-foreground">
          Create Account
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Save your coasters and entries so they follow you across devices.
        </p>
      </header>

      <SignupForm />
    </div>
  );
}
