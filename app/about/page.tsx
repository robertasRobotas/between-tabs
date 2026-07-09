import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/Newsletter";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "About",
  description:
    "BehindTabs covers the practical, real-world impact of technology — what happens after software leaves the browser tab and enters real work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container page">
      <header className="page-head about-head">
        <span className="eyebrow mono">About</span>
        <h1>What happens after the tab closes.</h1>
        <p className="page-lead">
          BehindTabs is a technology blog about software that creates real-world
          value — not dashboards, demos, and startup hype.
        </p>
      </header>

      <div className="prose about-prose">
        <p>
          Most technology writing stops at the screen. A product launches, the
          interface looks clean, the demo runs on rails, and the story ends
          there. BehindTabs starts where that story usually stops: the moment
          software leaves the browser tab and lands in someone&apos;s actual
          job.
        </p>

        <h2>Beyond dashboards and demos</h2>
        <p>
          We cover SaaS, developer tools, AI products, and digital platforms —
          but we judge them by a single standard: the work they change. A tool
          that removes a meeting, clears a queue, or gets something shipped a day
          earlier is more interesting to us than one with a beautiful empty
          state and nothing behind it.
        </p>

        <h2>Software for the world, not just for software</h2>
        <p>
          A lot of what gets built today exists mainly to help people build more
          software — tools for the people who make tools. That loop is
          comfortable, and it is not where most of the real problems live.
          BehindTabs focuses on the opposite: technology that reaches logistics,
          healthcare, education, operations, sales, support, and the ordinary
          shape of daily work.
        </p>

        <h2>Not hype. Not another list of tools.</h2>
        <p>
          We are smart, direct, and a little opinionated. We are not here to
          chase &ldquo;the future of technology&rdquo; in the abstract, or to
          publish another roundup of apps. We are here to explain how software
          actually changes how people work, build, sell, support, learn, and
          operate — and to say so plainly when it doesn&apos;t.
        </p>

        <h2>What we cover</h2>
        <p>Everything we publish lives in one of six beats:</p>
        <ul>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`}>{c.name}</Link> — {c.tagline}.
            </li>
          ))}
        </ul>

        <p>
          If that is the kind of technology writing you have been missing, the
          newsletter is the best way to keep up.
        </p>
      </div>

      <Newsletter />
    </div>
  );
}
