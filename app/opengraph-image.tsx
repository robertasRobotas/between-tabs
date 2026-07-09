import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

export default function Image() {
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div
              style={{
                width: 26,
                height: 30,
                background: "#17171a",
                borderRadius: "8px 8px 0 0",
              }}
            />
            <div
              style={{
                width: 26,
                height: 30,
                background: "#b1573a",
                borderRadius: "8px 8px 0 0",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
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
            flexDirection: "column",
            fontSize: 66,
            fontWeight: 700,
            color: "#17171a",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          Where software meets real work.
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>
          The real-world impact of SaaS, AI, and developer tools.
        </div>
      </div>
    ),
    size
  );
}
