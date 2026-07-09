import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Behind Tabs — WC 2026 Predictions",
  description:
    "Create a World Cup 2026 prediction group, share it with friends, and see who calls the champion.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <div className="container nav-inner">
            <Link href="/" className="brand">
              <span className="brand-dot">🏆</span>
              <span>Behind Tabs</span>
            </Link>
            <Link href="/wc2026" className="btn btn-sm btn-primary">
              WC 2026
            </Link>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
