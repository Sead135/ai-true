import type { Role } from "@ii/shared";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type RefreshTokenPayload = {
  sub: string;
  type: "refresh";
};
