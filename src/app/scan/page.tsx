import { QrScanner } from "@/components/qr-scanner";
import { PageHeader } from "@/components/page-header";

export default function ScanPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="Scan a Coaster"
        subtitle="Point your camera at the QR code on the coaster"
        align="center"
      />

      <QrScanner />
    </div>
  );
}
