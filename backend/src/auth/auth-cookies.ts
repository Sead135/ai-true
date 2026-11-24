import type { CookieOptions, Response } from "express";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
};

function ttlToMs(ttl: string, fallbackMs: number): number {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return amount * mult;
}

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function setAuthCookies(res: Response, tokens: IssuedTokens): void {
  const base = baseCookieOptions();
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: ttlToMs(tokens.expiresIn, 15 * 60_000),
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: ttlToMs(tokens.refreshExpiresIn, 7 * 86_400_000),
  });
}

export function clearAuthCookies(res: Response): void {
  const base = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}
