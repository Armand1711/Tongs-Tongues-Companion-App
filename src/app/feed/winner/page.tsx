import { DEMO_VOUCHER } from "@/lib/demo/data";
import { WinnerReveal } from "@/components/winner-reveal";

export default function WinnerPage() {
  return (
    <div className="mx-auto max-w-md">
      <WinnerReveal code={DEMO_VOUCHER.code} theme={DEMO_VOUCHER.challengeTheme} />
    </div>
  );
}
