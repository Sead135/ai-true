import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { GetStatsQueryDto } from "./dto/get-stats.query.dto.js";
import { StatsResponseDto } from "./dto/stats.dto.js";
import { StatsService } from "./stats.service.js";

@ApiTags("stats")
@ApiBearerAuth()
@ApiCookieAuth("access_token")
@Controller("stats")
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  @Roles("admin", "client")
  @ApiOkResponse({ type: StatsResponseDto })
  get(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetStatsQueryDto,
  ): Promise<StatsResponseDto> {
    return this.stats.get(req.user, query);
  }
}
