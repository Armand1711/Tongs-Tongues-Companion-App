import { MapPin, Phone, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyLatestVoucher } from "@/lib/supabase/queries";
import { RETAILERS } from "@/lib/constants";

export default async function RedeemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const voucher = user ? await getMyLatestVoucher(supabase, user.id) : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="space-y-1">
        <h1 className="font-heading text-xl font-bold uppercase tracking-tight">
          Redeem
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Show your reward code in-store, or a completed coaster set.
        </p>
      </header>

      {voucher && (
        <div className="rounded-2xl bg-weber-black p-4 text-weber-cream">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.15em] text-[#e8925f]">
            Challenge Voucher
          </p>
          <p className="font-heading text-base font-bold tracking-wide">
            {voucher.code}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {RETAILERS.map((retailer) => (
          <div
            key={`${retailer.name}-${retailer.suburb}`}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <p className="font-heading text-lg uppercase tracking-tight">
              {retailer.name}
            </p>
            <p className="text-sm font-medium text-primary">
              {retailer.suburb}, {retailer.city}
            </p>

            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{retailer.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span>{retailer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                <span>{retailer.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
