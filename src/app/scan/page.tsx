import { QrScanner } from "@/components/qr-scanner";

export default function ScanPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="space-y-1 text-center">
        <h1 className="font-heading text-xl font-bold uppercase tracking-tight">
          Scan a Coaster
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Point your camera at the QR code on the coaster
        </p>
      </header>

      <QrScanner />
    </div>
  );
}
