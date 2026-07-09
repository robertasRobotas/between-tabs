import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { getCategoryByName, type Category } from "./categories";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type TocItem = { level: number; text: string; slug: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  author: string;
  authorRole?: string;
  category: string;
  categorySlug: string;
  featured: boolean;
  readingTime: number;
};

export type Post = PostMeta & {
  content: string;
  toc: TocItem[];
};

function readRaw(slug: string): { data: Record<string, unknown>; content: string } {
  const full = path.join(POSTS_DIR, `${slug}.mdx`);
  const file = fs.readFileSync(full, "utf8");
  return matter(file);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function computeReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function extractToc(content: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  const lines = content.split("\n");
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (m) {
      const level = m[1].length;
      const text = m[2].replace(/[*_`]/g, "").trim();
      items.push({ level, text, slug: slugger.slug(text) });
    }
  }
  return items;
}

function toMeta(slug: string): PostMeta & { content: string } {
  const { data, content } = readRaw(slug);
  const categoryName = String(data.category ?? "Workflow Impact");
  const category: Category | undefined = getCategoryByName(categoryName);
  const date = String(data.date ?? "1970-01-01");
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date,
    dateLabel: formatDate(date),
    author: String(data.author ?? "BehindTabs"),
    authorRole: data.authorRole ? String(data.authorRole) : undefined,
    category: categoryName,
    categorySlug: category?.slug ?? "workflow-impact",
    featured: Boolean(data.featured ?? false),
    readingTime: computeReadingTime(content),
    content,
  };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const { content, ...meta } = toMeta(slug);
      void content;
      return meta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  try {
    const { content, ...meta } = toMeta(slug);
    return { ...meta, content, toc: extractToc(content) };
  } catch {
    return null;
  }
}

export function getFeaturedPosts(): PostMeta[] {
  const featured = getAllPosts().filter((p) => p.featured);
  return featured.length ? featured : getAllPosts().slice(0, 3);
}

export function getPostsByCategory(categorySlug: string): PostMeta[] {
  return getAllPosts().filter((p) => p.categorySlug === categorySlug);
}

export function getRelatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const sameCat = all.filter((p) => p.categorySlug === post.categorySlug);
  const rest = all.filter((p) => p.categorySlug !== post.categorySlug);
  return [...sameCat, ...rest].slice(0, limit);
}
