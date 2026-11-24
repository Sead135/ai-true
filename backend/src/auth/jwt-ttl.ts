import type { JwtSignOptions } from "@nestjs/jwt";

export function jwtTtl(value: string | undefined, fallback: string): JwtSignOptions["expiresIn"] {
  return (value ?? fallback) as JwtSignOptions["expiresIn"];
}
