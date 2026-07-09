import { MongoClient, Db } from "mongodb";

// Cached MongoDB connection (survives dev hot reloads via globalThis).

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "wc2026";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to .env.local.");
}

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoIndexesReady?: Promise<void>;
};

const client = new MongoClient(uri);
const clientPromise =
  globalForMongo._mongoClientPromise ??
  (globalForMongo._mongoClientPromise = client.connect());

async function ensureIndexes(db: Db): Promise<void> {
  if (!globalForMongo._mongoIndexesReady) {
    globalForMongo._mongoIndexesReady = (async () => {
      await db.collection("pools").createIndex({ id: 1 }, { unique: true });
    })().catch(() => {
      globalForMongo._mongoIndexesReady = undefined;
    });
  }
  await globalForMongo._mongoIndexesReady;
}

export async function getDb(): Promise<Db> {
  const connected = await clientPromise;
  const db = connected.db(dbName);
  await ensureIndexes(db);
  return db;
}
