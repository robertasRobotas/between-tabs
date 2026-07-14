import type { Metadata } from "next";
import favicon from "@/assets/real-world/favicon/cards-logo.webp";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: favicon.src, type: "image/webp" }],
    shortcut: [{ url: favicon.src, type: "image/webp" }],
    apple: [{ url: favicon.src, type: "image/webp" }],
  },
};

export default function WcPlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
