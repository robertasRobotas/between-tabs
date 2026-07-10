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
  label: string;
  description: string;
  image?: StaticImageData;
};

const tabs: Tab[] = [
  {
    href: "/wc-26-player",
    label: "Football player card",
    description:
      "Turn any player photo into a collectible-style card and download it.",
    image: wc26PlayerCards,
  },
  {
    href: "/wc2026",
    label: "World Cup 2026",
    description:
      "Create your bracket, make predictions, and share with your friends.",
    image: wc2026Knockout,
  },
];

export default function InteractWithNewsPage() {
  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow mono">Interactive</span>
        <h1>Interact with news.</h1>
      </header>

      <div className="interact-grid">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="interact-tab">
            <div className="interact-tab-body">
              <h2>{tab.label}</h2>
              <p>{tab.description}</p>
              <span className="interact-go mono">Open →</span>
            </div>
            {tab.image && (
              <div className="interact-tab-media">
                <Image
                  src={tab.image}
                  alt={tab.label}
                  sizes="(max-width: 720px) 100vw, 40vw"
                  priority
                />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
