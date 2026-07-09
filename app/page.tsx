import Link from "next/link";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import { getAllPosts, getFeaturedPosts } from "@/lib/posts";
import { categories } from "@/lib/categories";
import { site } from "@/lib/site";

export default function Home() {
  const featured = getFeaturedPosts().slice(0, 3);
  const latest = getAllPosts().slice(0, 5);

  return (
    <div className="container">
      <section className="home-hero">
        <span className="eyebrow mono">
          <span className="dot-live" />
          {site.tagline}
        </span>
        <h1 className="home-hero-title">
          BehindTabs explores the real-world impact of{" "}
          <span className="grad">SaaS, AI tools, developer tools</span>, and
          internet products.
        </h1>
        <p className="home-hero-lead">
          Not hype. Not another list of tools. We focus on software that changes
          how people work, build, sell, support, learn, and operate in the real
          world.
        </p>
        <div className="hero-cta">
          <Link href="/blog" className="btn btn-primary">
            Read the articles
          </Link>
          <Link href="/about" className="btn btn-ghost">
            What we cover
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Featured</h2>
          <Link href="/blog" className="link-arrow">
            All articles →
          </Link>
        </div>
        <div className="feature-grid">
          {featured.map((post) => (
            <PostCard key={post.slug} post={post} variant="feature" />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Latest</h2>
          <Link href="/blog" className="link-arrow">
            View archive →
          </Link>
        </div>
        <div className="post-list">
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} variant="row" />
          ))}
        </div>
      </section>

      <section className="section" id="categories">
        <div className="section-head">
          <h2>Categories</h2>
          <span className="link-arrow mono">6 beats</span>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="category-card"
            >
              <span className="category-index mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <span className="category-go mono">Browse →</span>
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
