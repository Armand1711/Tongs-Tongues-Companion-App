import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyLatestVoucher } from "@/lib/supabase/queries";
import { WinnerReveal } from "@/components/winner-reveal";

export default async function WinnerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const voucher = user ? await getMyLatestVoucher(supabase, user.id) : null;

  if (!voucher) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 pt-16 text-center">
        <p className="text-sm text-muted-foreground">
          No voucher to show yet — win a monthly challenge to unlock one.
        </p>
        <Link href="/feed" className="text-sm font-semibold text-primary">
          Back to Challenge
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <WinnerReveal code={voucher.code} theme={voucher.challengeTheme} />
    </div>
  );
}
