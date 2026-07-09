import { NextResponse } from "next/server";
import { getPool, toPublicPool, updatePool } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const pool = await getPool(id);
  if (!pool) {
    return NextResponse.json({ error: "Group not found." }, { status: 404 });
  }
  return NextResponse.json({ pool: toPublicPool(pool) });
}

// Organiser updates the actual results. Requires the admin key that was handed
// to the creator when the group was made.
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const pool = await getPool(id);
  if (!pool) {
    return NextResponse.json({ error: "Group not found." }, { status: 404 });
  }

  const key =
    request.headers.get("x-admin-key") ??
    (await request
      .clone()
      .json()
      .then((b) => b?.adminKey)
      .catch(() => null));

  if (!key || key !== pool.adminKey) {
    return NextResponse.json(
      { error: "Only the organiser can update the results." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const updated = await updatePool(id, (p) => {
    if (body?.actual && typeof body.actual === "object") {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(body.actual)) {
        const val = String(v ?? "").trim();
        if (val) clean[k] = val;
      }
      p.actual = clean;
    }
    if (typeof body?.title === "string" && body.title.trim()) {
      p.title = body.title.trim();
    }
  });

  return NextResponse.json({ pool: updated ? toPublicPool(updated) : null });
}
