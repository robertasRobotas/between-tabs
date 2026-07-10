import crypto from "crypto";
import type { Document } from "mongodb";
import { getDb } from "./mongo";

// Shared scratch cards live in their own collection.
const CARDS_COLLECTION = "cards";

export type CardDoc = {
  id: string;
  png: string; // data URL of the rendered card
  createdAt: string;
};

const NO_ID = { projection: { _id: 0 } } as const;

/** Short, shareable id for card URLs. */
export function newCardId(): string {
  return crypto.randomBytes(5).toString("hex");
}

async function cards() {
  return (await getDb()).collection<CardDoc & Document>(CARDS_COLLECTION);
}

export async function saveCard(id: string, png: string): Promise<CardDoc> {
  const doc: CardDoc = { id, png, createdAt: new Date().toISOString() };
  await (await cards()).insertOne({ ...doc });
  return doc;
}

export async function getCard(id: string): Promise<CardDoc | undefined> {
  return (await (await cards()).findOne({ id }, NO_ID)) ?? undefined;
}
