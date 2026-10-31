import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const anton = localFont({ src: "./fonts/anton.woff2", variable: "--font-anton", display: "swap", weight: "400" });

export const metadata: Metadata = {
  title: "Cipher Sprint",
  description: "Decode as many secret words as you can in 60 seconds.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a08",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={anton.variable}>
      <body className="min-h-[100svh] bg-[#0a0a08] font-sans text-[#e7e9ea]">{children}</body>
    </html>
  );
}
