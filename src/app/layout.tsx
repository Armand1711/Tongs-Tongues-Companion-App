import type { Metadata, Viewport } from "next";
import { Oswald, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import { EmberField } from "@/components/ember-field";

const heading = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tongs & Tongues | Weber South Africa",
  description:
    "Collect Weber braai coasters, learn the words for your braai gear in five South African languages, and enter the monthly braai challenge to win a Weber voucher.",
};

export const viewport: Viewport = {
  themeColor: "#0b0705",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <EmberField />
        <main className="relative z-10 flex-1 pb-28">{children}</main>
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
