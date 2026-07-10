"use client";

import { useState } from "react";
import Link from "next/link";

export type Beat = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  article?: { title: string; slug: string };
};

export default function HomeTabs({ beats }: { beats: Beat[] }) {
  const [active, setActive] = useState(0);
  const beat = beats[active];

  return (
    <div className="tabstrip">
      <div className="tabstrip-bar" role="tablist" aria-label="Beats">
        {beats.map((b, i) => (
          <button
            key={b.slug}
            role="tab"
            id={`tab-${b.slug}`}
            aria-selected={i === active}
            aria-controls="tabstrip-panel"
            className={`tabstrip-tab mono${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="tabstrip-fav" aria-hidden />
            <span className="tabstrip-tab-label">{b.name}</span>
          </button>
        ))}
      </div>

      <div
        className="tabstrip-panel"
        id="tabstrip-panel"
        role="tabpanel"
        aria-labelledby={`tab-${beat.slug}`}
        key={beat.slug}
      >
        <span className="tabstrip-behind mono">behind this tab</span>
        <p className="tabstrip-tagline">{beat.tagline}.</p>
        <p className="tabstrip-desc">{beat.description}</p>

        <div className="tabstrip-foot">
          {beat.article ? (
            <Link href={`/blog/${beat.article.slug}`} className="tabstrip-latest">
              <span className="tabstrip-latest-label mono">Latest dispatch</span>
              <span className="tabstrip-latest-title">{beat.article.title}</span>
              <span className="tabstrip-arrow" aria-hidden>
                →
              </span>
            </Link>
          ) : (
            <span className="tabstrip-empty mono">First dispatch in progress</span>
          )}
          <Link href={`/category/${beat.slug}`} className="tabstrip-browse mono">
            Browse beat →
          </Link>
        </div>
      </div>
    </div>
  );
}
