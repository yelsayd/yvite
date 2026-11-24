import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ramadan Iftar",
  description: "An invitation and RSVP.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
