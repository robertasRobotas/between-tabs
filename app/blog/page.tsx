import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import { getAllPosts } from "@/lib/posts";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "All articles",
  description:
    "Every BehindTabs article — SaaS, developer tools, AI at work, startup reality, workflow impact, and internet culture.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow mono">The archive</span>
        <h1>All articles</h1>
        <p className="page-lead">
          Software that changes how people work, build, sell, support, learn, and
          operate. Filter by beat, or read straight down.
        </p>
      </header>

      <nav className="filter-bar" aria-label="Filter by category">
        <span className="filter-chip is-active">All</span>
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="filter-chip">
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} variant="row" />
        ))}
      </div>

      <Newsletter />
    </div>
  );
}
