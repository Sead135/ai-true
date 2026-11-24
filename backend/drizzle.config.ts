import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";
import { resolveDatabaseUrl } from "./src/database/connection-url";

for (const name of [".env", "../.env"] as const) {
  const path = resolve(process.cwd(), name);
  if (existsSync(path)) loadEnvFile(path);
}

export default defineConfig({
  out: "./src/database/migrations",
  schema: "./src/database/schema",
  dialect: "postgresql",
  dbCredentials: { url: resolveDatabaseUrl() },
});
