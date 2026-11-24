export const LOCAL_DATABASE_URL_FALLBACK =
  "postgres://app_db_local_user:pass@127.0.0.1:5432/app_db_local";

export type DatabaseEnv = {
  NEON_ENV?: string;
  DATABASE_URL?: string;
  LOCAL_DATABASE_URL?: string;
};

/** local → Docker Postgres; remote → Neon. Default local so prod URL is never used by accident. */
export function resolveDatabaseUrl(env: DatabaseEnv = process.env): string {
  const neonEnv = env.NEON_ENV ?? "local";

  if (neonEnv === "remote") {
    if (!env.DATABASE_URL) {
      throw new Error("NEON_ENV=remote requires DATABASE_URL (Neon).");
    }
    return env.DATABASE_URL;
  }

  if (neonEnv === "local") {
    return env.LOCAL_DATABASE_URL ?? LOCAL_DATABASE_URL_FALLBACK;
  }

  throw new Error(`Invalid NEON_ENV="${neonEnv}". Use "local" or "remote".`);
}
