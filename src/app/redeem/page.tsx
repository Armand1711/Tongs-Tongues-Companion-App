import { MapPin, Phone, Clock } from "lucide-react";
import { RETAILERS } from "@/lib/constants";

export default function RedeemPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Redeem Your Reward</p>
        <h1 className="font-heading text-3xl uppercase tracking-tight">
          Find a Retailer
        </h1>
        <p className="text-sm text-muted-foreground">
          Visit any of these stores and show your completed set to redeem
          your reward.
        </p>
      </header>

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
