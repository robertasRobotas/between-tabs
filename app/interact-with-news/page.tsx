import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interact with news",
  description:
    "Explore and interact with BehindTabs news — live trackers, predictions, and interactive coverage.",
  alternates: { canonical: "/interact-with-news" },
};

const tabs = [
  {
    href: "/wc2026",
    label: "World Cup 2026",
    description:
      "Follow the tournament with live coverage, results, and interactive tracking.",
  },
];

export default function InteractWithNewsPage() {
  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow mono">Interactive</span>
        <h1>Interact with news.</h1>
        <p className="page-lead">
          Go beyond reading. Pick a topic below to explore live trackers,
          predictions, and interactive coverage.
        </p>
      </header>

      <div className="interact-grid">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="interact-tab">
            <h2>{tab.label}</h2>
            <p>{tab.description}</p>
            <span className="interact-go mono">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
