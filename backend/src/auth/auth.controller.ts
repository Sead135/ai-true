import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "./auth-cookies.js";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { MeDto } from "./dto/me.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import { AuthSessionDto } from "./dto/tokens.dto.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import type { AuthenticatedRequest } from "./jwt-auth.guard.js";
import { Public } from "./public.decorator.js";
import { assertRateLimit } from "./rate-limit.js";
import { Roles } from "./roles.decorator.js";

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
    assertRateLimit({ key: `auth:${clientIp(req)}` });
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
    assertRateLimit({ key: `auth:${clientIp(req)}` });
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
  @Roles("admin", "client")
  @ApiBearerAuth()
  @ApiCookieAuth("access_token")
  @ApiOkResponse({ type: MeDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  me(@Req() req: AuthenticatedRequest): Promise<MeDto> {
    return this.auth.me(req.user);
  }

  @Patch("me")
  @Roles("admin", "client")
  @ApiBearerAuth()
  @ApiCookieAuth("access_token")
  @ApiOkResponse({ type: MeDto })
  updateProfile(@Req() req: AuthenticatedRequest, @Body() body: UpdateProfileDto): Promise<MeDto> {
    return this.auth.updateProfile(req.user, body);
  }

  @Delete("me")
  @Roles("client")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth("access_token")
  @ApiNoContentResponse()
  async deleteMe(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.deleteMe(req.user);
    clearAuthCookies(res);
  }
}

function clientIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}
