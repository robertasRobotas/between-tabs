import { NextResponse } from "next/server";
import { newCardId, saveCard } from "@/lib/cards";

// Store a rendered card PNG and return its shareable id.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    png?: string;
  } | null;

  const png = body?.png;
  if (!png || !png.startsWith("data:image/png")) {
    return NextResponse.json({ error: "Missing card image." }, { status: 400 });
  }
  // guard against absurdly large payloads (~8MB of base64)
  if (png.length > 8_000_000) {
    return NextResponse.json({ error: "Card image too large." }, { status: 413 });
  }

  const id = newCardId();
  await saveCard(id, png);
  return NextResponse.json({ id });
}
