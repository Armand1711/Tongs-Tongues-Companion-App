import { MapPin, Phone, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyLatestVoucher } from "@/lib/supabase/queries";
import { RETAILERS } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";

export default async function RedeemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const voucher = user ? await getMyLatestVoucher(supabase, user.id) : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="Redeem"
        subtitle="Show your reward code in-store, or a completed coaster set."
        watermark
      />

      {voucher && (
        <div className="sticker-border rounded-2xl bg-weber-black p-4 text-center text-weber-cream">
          <p className="mb-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Active Voucher
          </p>
          <p className="font-mono text-lg font-bold tracking-wide text-weber-ember">
            {voucher.code}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {RETAILERS.map((retailer) => (
          <div
            key={`${retailer.name}-${retailer.suburb}`}
            className="sticker-border rounded-2xl bg-card p-5"
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
