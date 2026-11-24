import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { resolveDatabaseUrl, type DatabaseEnv } from "./connection-url.js";
import * as schema from "./schema/index.js";

/** Wire into Nest when the first repository needs it. */
export function createDb(env: DatabaseEnv = process.env) {
  const pool = new Pool({ connectionString: resolveDatabaseUrl(env) });
  return { db: drizzle(pool, { schema }), pool };
}
