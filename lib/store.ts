import crypto from "crypto";
import type { Document } from "mongodb";
import { getDb, WC2026_COLLECTION } from "./mongo";
import type { Pool, PublicPool } from "./types";

// strip Mongo's _id from query results
const NO_ID = { projection: { _id: 0 } } as const;

export function newId(): string {
  return crypto.randomBytes(9).toString("hex");
}

/** Short, shareable, human-friendly id for group URLs. */
export function newShareId(): string {
  return crypto.randomBytes(5).toString("hex");
}

export function newAdminKey(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function pools() {
  return (await getDb()).collection<Pool & Document>(WC2026_COLLECTION);
}

/** Strip the admin secret before sending a pool to the browser. */
export function toPublicPool(pool: Pool): PublicPool {
  const rest = { ...pool } as Partial<Pool>;
  delete rest.adminKey;
  return rest as PublicPool;
}

export async function getPool(id: string): Promise<Pool | undefined> {
  const col = await pools();
  return (await col.findOne({ id }, NO_ID)) ?? undefined;
}

export async function createPool(pool: Pool): Promise<Pool> {
  const col = await pools();
  await col.insertOne({ ...pool });
  return pool;
}

export async function updatePool(
  id: string,
  mutate: (pool: Pool) => void,
): Promise<Pool | undefined> {
  const col = await pools();
  const pool = await col.findOne({ id }, NO_ID);
  if (!pool) return undefined;
  mutate(pool);
  pool.updatedAt = new Date().toISOString();
  await col.replaceOne({ id }, { ...pool });
  return pool;
}
