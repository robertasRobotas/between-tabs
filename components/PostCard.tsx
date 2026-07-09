import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

type Props = {
  post: PostMeta;
  variant?: "feature" | "card" | "row";
};

export default function PostCard({ post, variant = "card" }: Props) {
  const href = `/blog/${post.slug}`;

  if (variant === "row") {
    return (
      <Link href={href} className="post-row">
        <div className="post-meta mono">
          <span className="post-cat">{post.category}</span>
          {post.dateLabel}
        </div>
        <div className="post-body">
          <h3 className="post-title">{post.title}</h3>
          <p className="post-excerpt">{post.description}</p>
        </div>
        <div className="post-read mono">{post.readingTime} min</div>
      </Link>
    );
  }

  if (variant === "feature") {
    return (
      <Link href={href} className="feature-card">
        <span className="tab-chip mono">{post.category}</span>
        <h3 className="feature-card-title">{post.title}</h3>
        <p className="feature-card-excerpt">{post.description}</p>
        <div className="card-foot mono">
          <span>{post.dateLabel}</span>
          <span className="dotsep">·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="post-card">
      <span className="card-cat mono">{post.category}</span>
      <h3 className="post-card-title">{post.title}</h3>
      <p className="post-card-excerpt">{post.description}</p>
      <div className="card-foot mono">
        <span>{post.dateLabel}</span>
        <span className="dotsep">·</span>
        <span>{post.readingTime} min read</span>
      </div>
    </Link>
  );
}
