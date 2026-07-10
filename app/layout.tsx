import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Inter, Space_Mono } from "next/font/google";
import { site } from "@/lib/site";
import { categories } from "@/lib/categories";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "SaaS",
    "developer tools",
    "AI tools",
    "startups",
    "software",
    "workflows",
    "tech blog",
  ],
  authors: [{ name: site.name }],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${site.url}/feed.xml` },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

function Brand() {
  return (
    <Link href="/" className="brand" aria-label={`${site.name} home`}>
      <span className="brand-mark" aria-hidden>
        <span className="brand-tab" />
        <span className="brand-tab" />
      </span>
      <span className="brand-word">
        Behind<span className="brand-accent">Tabs</span>
      </span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <header className="nav">
          <div className="container nav-inner">
            <Brand />
            <nav className="nav-links" aria-label="Primary">
              {site.nav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/interact-with-news" className="btn btn-sm btn-ghost">
              Interact with news
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container footer-inner">
            <div className="footer-brand">
              <Brand />
              <p className="footer-tagline">{site.tagline}</p>
              <p className="footer-blurb">
                Technology beyond the browser — the real-world impact of SaaS, AI,
                developer tools, and internet products.
              </p>
            </div>

            <div className="footer-col">
              <h4>Categories</h4>
              <ul>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`}>{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>BehindTabs</h4>
              <ul>
                <li>
                  <Link href="/blog">All articles</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <a href="/feed.xml">RSS feed</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="container footer-base mono">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            <span>{site.domain}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
