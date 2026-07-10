import { NextResponse } from "next/server";
import { getGlobalResults, setGlobalResults } from "@/lib/globalResults";
import type { FirstRoundMatch } from "@/lib/types";

export async function GET() {
  const results = await getGlobalResults();
  return NextResponse.json(results);
}

// Site admin sets the official results. Guarded by WC2026_ADMIN_KEY.
export async function PATCH(request: Request) {
  const master = process.env.WC2026_ADMIN_KEY;
  if (!master) {
    return NextResponse.json(
      { error: "Results admin is not configured (WC2026_ADMIN_KEY missing)." },
      { status: 500 },
    );
  }

  const key =
    request.headers.get("x-admin-key") ??
    (await request
      .clone()
      .json()
      .then((b) => b?.adminKey)
      .catch(() => null));

  if (!key || key !== master) {
    return NextResponse.json(
      { error: "Invalid admin key." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body?.actual || typeof body.actual !== "object") {
    return NextResponse.json({ error: "Missing results." }, { status: 400 });
  }

  const firstRound: FirstRoundMatch[] | undefined = Array.isArray(
    body.firstRound,
  )
    ? body.firstRound
    : undefined;

  const results = await setGlobalResults(
    body.actual as Record<string, string>,
    firstRound,
  );
  return NextResponse.json(results);
}
