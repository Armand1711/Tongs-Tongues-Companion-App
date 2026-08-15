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
        <div className="sticker-border flex size-16 items-center justify-center rounded-full bg-weber-black">
          <UserCircle className="size-9 text-weber-cream" />
        </div>
        <h1 className="font-heading text-2xl uppercase tracking-tight text-foreground">
          Account
        </h1>
      </header>

      {isSignedIn ? (
        <div className="sticker-border flex flex-col gap-4 rounded-2xl bg-card p-5">
          <div>
            {user!.user_metadata?.display_name && (
              <p className="mb-2.5 font-heading text-lg uppercase tracking-tight text-foreground">
                {user!.user_metadata.display_name}
              </p>
            )}
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
        <div className="sticker-border flex flex-col gap-4 rounded-2xl bg-card p-5 text-center">
          <p className="text-sm text-foreground">
            You&apos;re browsing as a guest — your coasters and entries are
            saved to this device only, and disappear if you clear your
            browser data.
          </p>
          <p className="text-sm text-muted-foreground">
            Create an account and everything you&apos;ve already done here
            moves with you — nothing resets.
          </p>
          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              render={<Link href="/signup" />}
              nativeButton={false}
              className="btn-sticker h-12 rounded-xl bg-primary font-heading text-sm font-bold uppercase tracking-wide text-primary-foreground"
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
