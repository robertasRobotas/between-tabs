import { NextResponse } from "next/server";
import { createPool, newAdminKey, newShareId } from "@/lib/store";
import { isPowerOfTwo } from "@/lib/bracket";
import type { CreatePoolInput, FirstRoundMatch, Pool } from "@/lib/types";

// Create a group. The response is the ONLY time the admin key is returned — the
// creator's browser keeps it so they (and only they) can set results later.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreatePoolInput | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const firstRound: FirstRoundMatch[] = (
    Array.isArray(body.firstRound) ? body.firstRound : []
  )
    .map((m) => ({
      teamA: String(m?.teamA ?? "").trim(),
      teamB: String(m?.teamB ?? "").trim(),
      date: m?.date ? String(m.date).trim() : undefined,
    }))
    .filter((m) => m.teamA && m.teamB);

  if (!isPowerOfTwo(firstRound.length) || firstRound.length < 1) {
    return NextResponse.json(
      {
        error:
          "The opening round needs a power-of-two number of matches (1, 2, 4, 8 or 16), each with two teams.",
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const pool: Pool = {
    id: newShareId(),
    title: String(body.title ?? "").trim() || "WC 2026 Prediction Group",
    organiser: String(body.organiser ?? "").trim() || undefined,
    firstRound,
    actual: {},
    predictions: [],
    adminKey: newAdminKey(),
    createdAt: now,
    updatedAt: now,
  };

  await createPool(pool);
  // return the full pool (incl. adminKey) only to the creator
  return NextResponse.json({ pool, adminKey: pool.adminKey });
}
