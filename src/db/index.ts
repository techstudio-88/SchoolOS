import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __schoolOsPool?: Pool;
};

// Supabase (and most hosted Postgres) requires SSL. Local Postgres does not.
const isLocal = /127\.0\.0\.1|localhost/.test(databaseUrl);
const isServerless = Boolean(process.env.VERCEL);

export const pool =
  globalForDb.__schoolOsPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    // On Vercel each lambda should hold very few connections (Supabase pooler handles the rest).
    max: isServerless ? 1 : 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__schoolOsPool = pool;
}

export const db = drizzle(pool, { schema });
export * from "./schema";
