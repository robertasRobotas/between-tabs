import { NextResponse } from "next/server";
import { newId, toPublicPool, updatePool } from "@/lib/store";
import type { Prediction } from "@/lib/types";

// Save a bracket prediction. Anonymous — upserts by name so re-submitting the
// same name updates rather than creating a duplicate.
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const picksRaw = body?.picks;

  if (!name) {
    return NextResponse.json(
      { error: "Please enter your name before saving." },
      { status: 400 },
    );
  }

  const picks: Record<string, string> = {};
  if (picksRaw && typeof picksRaw === "object") {
    for (const [k, v] of Object.entries(picksRaw)) {
      const val = String(v ?? "").trim();
      if (val) picks[k] = val;
    }
  }

  const now = new Date().toISOString();
  const updated = await updatePool(id, (pool) => {
    const existing = pool.predictions.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      existing.name = name;
      existing.picks = picks;
      existing.updatedAt = now;
    } else {
      const prediction: Prediction = {
        id: newId(),
        name,
        picks,
        createdAt: now,
        updatedAt: now,
      };
      pool.predictions.push(prediction);
    }
  });

  if (!updated) {
    return NextResponse.json({ error: "Group not found." }, { status: 404 });
  }
  return NextResponse.json({ pool: toPublicPool(updated) });
}
