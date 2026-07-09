import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { getPostsByCategory } from "@/lib/posts";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: `${category.name} — BehindTabs`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const posts = getPostsByCategory(category.slug);

  return (
    <div className="container page">
      <header className="page-head">
        <span className="eyebrow mono">Category</span>
        <h1>{category.name}</h1>
        <p className="page-lead">{category.description}</p>
      </header>

      <nav className="filter-bar" aria-label="Filter by category">
        <Link href="/blog" className="filter-chip">
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className={`filter-chip${c.slug === category.slug ? " is-active" : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {posts.length ? (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} variant="row" />
          ))}
        </div>
      ) : (
        <p className="empty-note">
          No articles in this category yet — new writing lands most Fridays.
        </p>
      )}

      <Newsletter />
    </div>
  );
}
