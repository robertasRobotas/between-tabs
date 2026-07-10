import type { Metadata } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import wc2026Knockout from "@/assets/real-world/images/wc2026knockout.webp";
import wc26PlayerCards from "@/assets/real-world/images/wc26playerCards.webp";

export const metadata: Metadata = {
  title: "Interact with news",
  description:
    "Explore and interact with BehindTabs news — live trackers, predictions, and interactive coverage.",
  alternates: { canonical: "/interact-with-news" },
};

type Tab = {
  href: string;
  path: string;
  kind: string;
  label: string;
  description: string;
  cta: string;
  meta: string[];
  image?: StaticImageData;
};

const tabs: Tab[] = [
  {
    href: "/wc-26-player",
    path: "behindtabs.com/wc-26-player",
    kind: "Card generator",
    label: "Football player card",
    description:
      "Turn any player photo into a collectible-style card — auto background removal, live preview, ready to download.",
    cta: "Open the generator",
    meta: ["Upload a photo", "Download PNG", "Free"],
    image: wc26PlayerCards,
  },
  {
    href: "/wc2026",
    path: "behindtabs.com/wc2026",
    kind: "Prediction game",
    label: "World Cup 2026",
    description:
      "Fill out the knockout bracket, lock in your predictions, and track them against friends on a shared leaderboard.",
    cta: "Build your bracket",
    meta: ["Bracket", "Predictions", "Leaderboard"],
    image: wc2026Knockout,
  },
];

export default function InteractWithNewsPage() {
  return (
    <div className="container page">
      <header className="page-head interact-head">
        <span className="eyebrow mono">
          <span className="dot-live" />
          Interactive
        </span>
        <h1>Interact with the news.</h1>
        <p className="page-lead">
          Small tools that live behind the coverage — open one in a tab and play
          with the story instead of just reading it.
        </p>
      </header>

      <div className="interact-grid">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="interact-tab">
            <span className="interact-chrome mono" aria-hidden>
              <span className="interact-chrome-dot" />
              <span className="interact-chrome-path">{tab.path}</span>
              <span className="interact-chrome-bar" />
            </span>

            <div className="interact-tab-inner">
              <div className="interact-tab-body">
                <span className="interact-kind mono">{tab.kind}</span>
                <h2>{tab.label}</h2>
                <p>{tab.description}</p>
                <ul className="interact-meta mono" aria-hidden>
                  {tab.meta.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <span className="interact-go btn btn-primary btn-sm">
                  {tab.cta}
                  <span className="interact-go-arrow" aria-hidden>
                    →
                  </span>
                </span>
              </div>

              {tab.image && (
                <div className="interact-tab-media">
                  <Image
                    src={tab.image}
                    alt={tab.label}
                    sizes="(max-width: 720px) 100vw, 46vw"
                    priority
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
