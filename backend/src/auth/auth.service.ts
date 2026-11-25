import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import type { IssuedTokens } from "./auth-cookies";
import type { AccessTokenPayload, RefreshTokenPayload } from "./auth.types";
import type { MeDto } from "./dto/me.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { JwtSignOptions } from "@nestjs/jwt";
import { DRIZZLE } from "../database/database.module";
import type { createDb } from "../database/db";
import { users, type User } from "../database/schema/index";

type Db = ReturnType<typeof createDb>["db"];

const BCRYPT_ROUNDS = 10;

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

  async register(email: string, password: string): Promise<IssuedTokens> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const [user] = await this.db
      .insert(users)
      .values({
        email,
        passwordHash: await hash(password, BCRYPT_ROUNDS),
        role: "client",
        companyId: null,
      })
      .returning();

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

  async me(actor: AccessTokenPayload): Promise<MeDto> {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, actor.sub) });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return toMe(user);
  }

  async updateProfile(actor: AccessTokenPayload, dto: UpdateProfileDto): Promise<MeDto> {
    const existing = await this.db.query.users.findFirst({ where: eq(users.id, actor.sub) });
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    const [updated] = await this.db
      .update(users)
      .set({
        ...(dto.name !== undefined ? { name: dto.name.trim() || null } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl || null } : {}),
      })
      .where(eq(users.id, actor.sub))
      .returning();

    return toMe(updated);
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
        expiresIn: accessExpiresIn as JwtSignOptions["expiresIn"],
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: refreshExpiresIn as JwtSignOptions["expiresIn"],
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

function toMe(user: User): MeDto {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
  };
}
