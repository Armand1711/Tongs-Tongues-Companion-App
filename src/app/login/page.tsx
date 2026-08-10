import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
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
          Log In
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Sign back in to pick up your collection on this device.
        </p>
      </header>

      <LoginForm />
    </div>
  );
}
