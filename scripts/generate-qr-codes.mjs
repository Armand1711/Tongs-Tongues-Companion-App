// Generates a print-ready QR PNG per coaster, encoding the card's `id` from
// supabase/schema.sql — the same string src/components/qr-scanner.tsx reads
// (decodedText.trim().toUpperCase()) to look the card up via getCardById.
// Re-run whenever the coaster catalog in schema.sql changes.
//
// Usage: npm run generate-qr

import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CARD_IDS = [
  "ZU-01",
  "ZU-02",
  "ZU-03",
  "XH-01",
  "XH-02",
  "XH-03",
  "AF-01",
  "AF-02",
  "AF-03",
];

const OUT_DIR = path.join(process.cwd(), "qr-codes");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const id of CARD_IDS) {
    const file = path.join(OUT_DIR, `${id}.png`);
    await QRCode.toFile(file, id, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 1000,
      color: { dark: "#201510", light: "#ffffff" },
    });
    console.log(`wrote ${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
