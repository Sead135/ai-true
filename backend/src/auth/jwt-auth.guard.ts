import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { ACCESS_COOKIE } from "./auth-cookies.js";
import type { AccessTokenPayload } from "./auth.types.js";
import { IS_PUBLIC_KEY } from "./public.decorator.js";

export type AuthenticatedRequest = Request & { user: AccessTokenPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractAccessToken(request);
    if (!token) {
      throw new UnauthorizedException("Missing access token");
    }

    try {
      request.user = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
      return true;
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  private extractAccessToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      return header.slice(7);
    }
    const cookie = request.cookies?.[ACCESS_COOKIE];
    return typeof cookie === "string" ? cookie : undefined;
  }
}
