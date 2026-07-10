import Link from "next/link";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import HomeTabs, { type Beat } from "@/components/HomeTabs";
import { getAllPosts, getFeaturedPosts } from "@/lib/posts";
import { categories } from "@/lib/categories";

export default function Home() {
  const all = getAllPosts();
  const featured = getFeaturedPosts().slice(0, 3);
  const latest = all.slice(0, 5);

  const beats: Beat[] = categories.map((c) => {
    const article = all.find((p) => p.categorySlug === c.slug);
    return {
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      article: article
        ? { title: article.title, slug: article.slug }
        : undefined,
    };
  });

  return (
    <div className="container">
      <section className="home-hero">
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
          Not the pricing page. Not the launch demo. BehindTabs covers what SaaS,
          AI, and developer tools actually do once the novelty wears off — the
          real work waiting behind every open tab.
        </p>
        <div className="hero-cta">
          <Link href="/blog" className="btn btn-primary">
            Read the articles
          </Link>
          <Link href="/interact-with-news" className="btn btn-ghost">
            Interact with the news
          </Link>
        </div>
      </section>

      <section className="section beats-section" id="categories">
        <div className="section-head">
          <h2>Six beats</h2>
          <span className="link-arrow mono">Open a tab →</span>
        </div>
        <HomeTabs beats={beats} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Featured</h2>
          <Link href="/blog" className="link-arrow mono">
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
          <Link href="/blog" className="link-arrow mono">
            View archive →
          </Link>
        </div>
        <div className="post-list">
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} variant="row" />
          ))}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
