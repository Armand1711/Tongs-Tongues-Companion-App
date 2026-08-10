"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Couldn't sign you out — try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={signingOut}
      onClick={handleSignOut}
      className="w-full rounded-xl font-heading text-xs font-bold uppercase tracking-wide"
    >
      {signingOut && <Loader2 className="size-4 animate-spin" />}
      {signingOut ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
