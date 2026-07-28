import { QrScanner } from "@/components/qr-scanner";

export default function ScanPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Scan</p>
        <h1 className="font-heading text-3xl uppercase tracking-tight">
          Collect a Card
        </h1>
      </header>

      <QrScanner />
    </div>
  );
}
