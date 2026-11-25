import { describe, expect, it } from "vitest";
import { isImageUrl } from "./is-image-url.js";

describe("isImageUrl", () => {
  it("accepts http(s) paths with image extensions", () => {
    expect(isImageUrl("https://cdn.example.com/logo.png")).toBe(true);
    expect(isImageUrl("http://cdn.example.com/a/b.JPEG?v=1")).toBe(true);
  });

  it("rejects non-images and bad urls", () => {
    expect(isImageUrl("https://cdn.example.com/logo")).toBe(false);
    expect(isImageUrl("ftp://cdn.example.com/logo.png")).toBe(false);
    expect(isImageUrl("not-a-url")).toBe(false);
  });
});
