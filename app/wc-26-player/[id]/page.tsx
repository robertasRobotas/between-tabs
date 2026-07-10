import type { Metadata } from "next";
import Link from "next/link";
import ScratchCard from "@/components/ScratchCard";

export const metadata: Metadata = {
  title: "Scratch the card",
  description: "Scratch to reveal the World Cup 26 player card.",
  robots: { index: false },
};

export default async function ScratchCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container page fp-page">
      <header className="page-head">
        <span className="eyebrow mono">World Cup 26</span>
      </header>

      <ScratchCard id={id} />

      <p className="scratch-cta">
        <Link href="/wc-26-player" className="btn btn-ghost">
          Make your own card →
        </Link>
      </p>
    </div>
  );
}
