import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Greenback OCR",
  description: "Receipt OCR service.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          margin: 0,
          padding: "2rem",
        }}
      >
        {children}
      </body>
    </html>
  );
}
