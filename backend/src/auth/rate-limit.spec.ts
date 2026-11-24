import { HttpException } from "@nestjs/common";
import { afterEach, describe, expect, it } from "vitest";
import { assertRateLimit, clearRateLimits } from "./rate-limit";

describe("assertRateLimit", () => {
  afterEach(() => clearRateLimits());

  it("allows up to limit then throws 429", () => {
    for (let i = 0; i < 5; i++) {
      assertRateLimit("login:test", 5, 60_000);
    }
    expect(() => assertRateLimit("login:test", 5, 60_000)).toThrow(HttpException);
  });

  it("isolates keys", () => {
    for (let i = 0; i < 5; i++) {
      assertRateLimit("login:a", 5, 60_000);
    }
    expect(() => assertRateLimit("login:b", 5, 60_000)).not.toThrow();
  });
});
