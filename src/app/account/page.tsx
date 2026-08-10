import Link from "next/link";
import { UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSignedIn = Boolean(user && !user.is_anonymous);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-weber-black">
          <UserCircle className="size-9 text-weber-cream" />
        </div>
        <h1 className="font-heading text-2xl uppercase tracking-tight text-foreground">
          Account
        </h1>
      </header>

      {isSignedIn ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {user!.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-foreground">
            You&apos;re browsing as a guest — your coasters and entries are
            saved to this device only.
          </p>
          <p className="text-sm text-muted-foreground">
            Create an account to save your progress across devices.
          </p>
          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              render={<Link href="/signup" />}
              nativeButton={false}
              className="h-12 rounded-xl border-0 font-heading text-sm font-bold uppercase tracking-wide"
              style={{
                background:
                  "linear-gradient(135deg, var(--weber-ember-start), var(--weber-ember-end))",
              }}
            >
              Create Account
            </Button>
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              variant="outline"
              className="h-12 rounded-xl font-heading text-sm font-bold uppercase tracking-wide"
            >
              Log In
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
