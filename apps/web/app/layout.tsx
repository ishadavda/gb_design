import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ServiceWorkerCleanup } from "./_components/ServiceWorkerCleanup";

/**
 * Manrope is the product typeface. Self-hosted through next/font rather than the
 * Google CDN the design prototype used, so there is no render-blocking request
 * and no layout shift when it swaps in.
 */
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Greenback Cash",
  description: "Cannabis retail rewards - scan a receipt, earn points.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Greenback",
  },
};

export const viewport: Viewport = {
  themeColor: "#00B4D8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="m-auto min-h-screen overflow-x-hidden bg-slate-page p-0 pt-1 font-sans text-navy">
        <ServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
