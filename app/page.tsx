import Link from "next/link";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <div className="container">
      <section className="home-hero home-hero--solo">
        <span className="eyebrow mono">
          <span className="dot-live" />
          Where software meets real work
        </span>
        <h1 className="home-hero-title mono">
          The software you use all day,
          <br />
          judged by <span className="grad">the work it changes.</span>
        </h1>
        <p className="home-hero-lead">
          BehindTabs is being built. The first dispatches — on SaaS, AI, and the
          developer tools that actually change how work gets done — are on the
          way. In the meantime, a couple of things to play with are already live.
        </p>
        <div className="hero-cta">
          <Link href="/interact-with-news" className="btn btn-primary">
            Try the interactive tools
          </Link>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
