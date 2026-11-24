import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { resolveDatabaseUrl, type DatabaseEnv } from "./connection-url";
import * as schema from "./schema/index";

export function createDb(env: DatabaseEnv = process.env) {
  const pool = new Pool({ connectionString: resolveDatabaseUrl(env) });
  return { db: drizzle(pool, { schema }), pool };
}
