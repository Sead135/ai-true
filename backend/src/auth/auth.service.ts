import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import type { IssuedTokens } from "./auth-cookies";
import type { AccessTokenPayload, RefreshTokenPayload } from "./auth.types";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { users, type User } from "../database/schema/index";

type Db = ReturnType<typeof createDb>["db"];

function jwtTtl(value: string | undefined, fallback: string): JwtSignOptions["expiresIn"] {
  return (value ?? fallback) as JwtSignOptions["expiresIn"];
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Db,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<IssuedTokens> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<IssuedTokens> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (payload.type !== "refresh" || !payload.sub) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });
    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User): Promise<IssuedTokens> {
    const accessExpiresIn = this.config.get<string>("JWT_ACCESS_TTL") ?? "15m";
    const refreshExpiresIn = this.config.get<string>("JWT_REFRESH_TTL") ?? "7d";

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      type: "refresh",
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.accessSecret,
        expiresIn: jwtTtl(accessExpiresIn, "15m"),
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: jwtTtl(refreshExpiresIn, "7d"),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn,
    };
  }

  private get accessSecret(): string {
    return this.config.getOrThrow<string>("JWT_ACCESS_SECRET");
  }

  private get refreshSecret(): string {
    return this.config.getOrThrow<string>("JWT_REFRESH_SECRET");
  }
}
