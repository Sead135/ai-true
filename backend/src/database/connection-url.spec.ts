import { describe, expect, it } from "vitest";
import { LOCAL_DATABASE_URL_FALLBACK, resolveDatabaseUrl } from "./connection-url.js";

describe("resolveDatabaseUrl", () => {
  it("defaults to local Docker URL", () => {
    expect(resolveDatabaseUrl({})).toBe(LOCAL_DATABASE_URL_FALLBACK);
  });

  it("uses LOCAL_DATABASE_URL when local", () => {
    expect(
      resolveDatabaseUrl({
        NEON_ENV: "local",
        LOCAL_DATABASE_URL: "postgres://local/db",
        DATABASE_URL: "postgres://neon/db",
      }),
    ).toBe("postgres://local/db");
  });

  it("uses DATABASE_URL only when remote", () => {
    expect(
      resolveDatabaseUrl({
        NEON_ENV: "remote",
        DATABASE_URL: "postgres://neon/db",
        LOCAL_DATABASE_URL: "postgres://local/db",
      }),
    ).toBe("postgres://neon/db");
  });

  it("rejects remote without DATABASE_URL", () => {
    expect(() => resolveDatabaseUrl({ NEON_ENV: "remote" })).toThrow(/DATABASE_URL/);
  });
});
