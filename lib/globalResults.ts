import type { Document } from "mongodb";
import { getDb } from "./mongo";
import { DEFAULT_FIRST_ROUND } from "./bracket";
import type { FirstRoundMatch } from "./types";

// A single global document holds the official WC 2026 results that every pool
// is scored against — organisers no longer set results per group.

const CONFIG_COLLECTION = "config";
const RESULTS_ID = "wc2026-results";

export type GlobalResults = {
  firstRound: FirstRoundMatch[];
  actual: Record<string, string>;
  updatedAt?: string;
};

type ResultsDoc = GlobalResults & { id: string };

async function config() {
  return (await getDb()).collection<ResultsDoc & Document>(CONFIG_COLLECTION);
}

export async function getGlobalResults(): Promise<GlobalResults> {
  const doc = await (await config()).findOne(
    { id: RESULTS_ID },
    { projection: { _id: 0 } },
  );
  return {
    firstRound: doc?.firstRound ?? DEFAULT_FIRST_ROUND.map((m) => ({ ...m })),
    actual: doc?.actual ?? {},
    updatedAt: doc?.updatedAt,
  };
}

export async function getGlobalActual(): Promise<Record<string, string>> {
  return (await getGlobalResults()).actual;
}

export async function setGlobalResults(
  actual: Record<string, string>,
  firstRound?: FirstRoundMatch[],
): Promise<GlobalResults> {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(actual)) {
    const val = String(v ?? "").trim();
    if (val) clean[k] = val;
  }
  const updatedAt = new Date().toISOString();
  await (await config()).updateOne(
    { id: RESULTS_ID },
    {
      $set: {
        id: RESULTS_ID,
        actual: clean,
        updatedAt,
        ...(firstRound ? { firstRound } : {}),
      },
    },
    { upsert: true },
  );
  return getGlobalResults();
}
