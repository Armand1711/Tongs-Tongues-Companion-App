import type { Metadata, Viewport } from "next";
import { Manrope, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import { EmberField } from "@/components/ember-field";

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const brush = Permanent_Marker({
  variable: "--font-brush",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Tongs & Tongues | Weber South Africa",
  description:
    "Collect Weber braai coasters, learn the words for your braai gear in five South African languages, and enter the monthly braai challenge to win a Weber voucher.",
};

export const viewport: Viewport = {
  themeColor: "#f4efe1",
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
      className={`${body.variable} ${brush.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/wdk6adl.css" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <EmberField />
        <main className="relative z-10 flex-1 pb-28">{children}</main>
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
