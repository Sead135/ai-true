export type Role = "admin" | "client";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type RefreshTokenPayload = {
  sub: string;
  type: "refresh";
};
