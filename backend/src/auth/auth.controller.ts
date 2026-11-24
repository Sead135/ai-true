import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "./auth-cookies";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { MeDto } from "./dto/me.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthSessionDto } from "./dto/tokens.dto";
import type { AuthenticatedRequest } from "./jwt-auth.guard";
import { Public } from "./public.decorator";
import { assertRateLimit } from "./rate-limit";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @ApiCreatedResponse({ type: AuthSessionDto })
  @ApiConflictResponse({ description: "Email already registered" })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded" })
  async register(
    @Req() req: Request,
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    assertRateLimit(`auth:${clientIp(req)}`);
    const tokens = await this.auth.register(body.email, body.password);
    setAuthCookies(res, tokens);
    return { expiresIn: tokens.expiresIn };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthSessionDto })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded" })
  async login(
    @Req() req: Request,
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    assertRateLimit(`auth:${clientIp(req)}`);
    const tokens = await this.auth.login(body.email, body.password);
    setAuthCookies(res, tokens);
    return { expiresIn: tokens.expiresIn };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth("refresh_token")
  @ApiOkResponse({ type: AuthSessionDto })
  @ApiUnauthorizedResponse({ description: "Invalid or expired refresh token" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new UnauthorizedException("Missing refresh token");
    }

    const tokens = await this.auth.refresh(refreshToken);
    setAuthCookies(res, tokens);
    return { expiresIn: tokens.expiresIn };
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    clearAuthCookies(res);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiCookieAuth("access_token")
  @ApiOkResponse({ type: MeDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  me(@Req() req: AuthenticatedRequest): MeDto {
    return {
      sub: req.user.sub,
      email: req.user.email,
      role: req.user.role,
    };
  }
}

function clientIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}
