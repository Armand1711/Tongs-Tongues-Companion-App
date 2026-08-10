"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // createClient()'s underlying GoTrue client auto-parses the
    // access/refresh tokens (or PKCE `code`) out of this page's URL on
    // init — awaiting getSession() just waits for that to finish before
    // we hand off to a page that reads the session from the server.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/account");
        router.refresh();
      } else {
        setFailed(true);
      }
    });
  }, [router]);

  if (failed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 pt-24 text-center">
        <p className="font-heading text-sm uppercase tracking-wide text-foreground">
          That confirmation link didn&apos;t work
        </p>
        <p className="text-sm text-muted-foreground">
          It may have expired. Try signing up again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 pt-24 text-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Confirming your account...</p>
    </div>
  );
}
