import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} article`;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? site.name;
  const category = post?.category ?? "BehindTabs";
  const meta = post
    ? `${post.dateLabel} · ${post.readingTime} min read`
    : site.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbfbfa",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div
                style={{
                  width: 24,
                  height: 28,
                  background: "#17171a",
                  borderRadius: "7px 7px 0 0",
                }}
              />
              <div
                style={{
                  width: 24,
                  height: 28,
                  background: "#b1573a",
                  borderRadius: "7px 7px 0 0",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: "#17171a",
              }}
            >
              Behind<span style={{ color: "#b1573a" }}>Tabs</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#b1573a",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 56 : 68,
            fontWeight: 700,
            color: "#17171a",
            letterSpacing: "-0.03em",
            lineHeight: 1.06,
            maxWidth: 1050,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>
          {meta}
        </div>
      </div>
    ),
    size
  );
}
