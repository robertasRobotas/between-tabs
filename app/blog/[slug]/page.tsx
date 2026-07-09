import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import { getPost, getPostSlugs, getRelatedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${site.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      authors: [post.author],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);
  const showToc = post.toc.length >= 3;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    articleSection: post.category,
  };

  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="article">
        <header className="article-head">
          <Link
            href={`/category/${post.categorySlug}`}
            className="tab-chip mono"
          >
            {post.category}
          </Link>
          <h1 className="article-title">{post.title}</h1>
          <p className="article-standfirst">{post.description}</p>
          <div className="byline">
            <span className="byline-author">{post.author}</span>
            <span className="dotsep">·</span>
            <time dateTime={post.date}>{post.dateLabel}</time>
            <span className="dotsep">·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        <div className={`article-body${showToc ? " has-toc" : ""}`}>
          {showToc && (
            <aside className="toc" aria-label="Table of contents">
              <p className="toc-label mono">On this page</p>
              <nav>
                <ul>
                  {post.toc.map((item) => (
                    <li key={item.slug} data-level={item.level}>
                      <a href={`#${item.slug}`}>{item.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}

          <div className="prose">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section related">
          <div className="section-head">
            <h2>Keep reading</h2>
            <Link href="/blog" className="link-arrow">
              All articles →
            </Link>
          </div>
          <div className="card-grid">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} variant="card" />
            ))}
          </div>
        </section>
      )}

      <Newsletter />
    </div>
  );
}
