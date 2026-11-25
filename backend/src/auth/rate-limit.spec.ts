import { HttpException } from "@nestjs/common";
import { afterEach, describe, expect, it } from "vitest";
import { assertRateLimit, clearRateLimits } from "./rate-limit.js";

describe("assertRateLimit", () => {
  afterEach(() => clearRateLimits());

  it("allows up to limit then throws 429", () => {
    for (let i = 0; i < 5; i++) {
      assertRateLimit({ key: "login:test", limit: 5, windowMs: 60_000 });
    }
    expect(() => assertRateLimit({ key: "login:test", limit: 5, windowMs: 60_000 })).toThrow(
      HttpException,
    );
  });

  it("isolates keys", () => {
    for (let i = 0; i < 5; i++) {
      assertRateLimit({ key: "login:a", limit: 5, windowMs: 60_000 });
    }
    expect(() => assertRateLimit({ key: "login:b", limit: 5, windowMs: 60_000 })).not.toThrow();
  });
});
