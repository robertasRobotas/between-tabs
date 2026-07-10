import { NextResponse } from "next/server";
import { getCard } from "@/lib/cards";

// Return the stored card as a PNG image.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const card = await getCard(id);
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  const base64 = card.png.split(",")[1] ?? "";
  const bytes = Buffer.from(base64, "base64");
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
