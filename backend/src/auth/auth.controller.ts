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
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { REFRESH_COOKIE, setAuthCookies } from "./auth-cookies";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { MeDto } from "./dto/me.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { AuthSessionDto } from "./dto/tokens.dto";
import type { AuthenticatedRequest } from "./jwt-auth.guard";
import { Public } from "./public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthSessionDto })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    const tokens = await this.auth.login(body.email, body.password);
    setAuthCookies(res, tokens);
    return { expiresIn: tokens.expiresIn };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthSessionDto })
  @ApiUnauthorizedResponse({ description: "Invalid or expired refresh token" })
  async refresh(
    @Req() req: Request,
    @Body() body: RefreshDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    const refreshToken = body.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new UnauthorizedException("Missing refresh token");
    }

    const tokens = await this.auth.refresh(refreshToken);
    setAuthCookies(res, tokens);
    return { expiresIn: tokens.expiresIn };
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
