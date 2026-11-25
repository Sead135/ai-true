import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/roles.decorator.js";
import { AdminStatsService } from "./admin-stats.service.js";
import {
  AdminStatsSeriesDto,
  AdminStatsSeriesQueryDto,
  AdminStatsSummaryDto,
} from "./dto/admin-stats.dto.js";

@ApiTags("admin-stats")
@ApiBearerAuth()
@ApiCookieAuth("access_token")
@Controller("admin/stats")
@Roles("admin")
export class AdminStatsController {
  constructor(private readonly adminStats: AdminStatsService) {}

  @Get("summary")
  @ApiOkResponse({ type: AdminStatsSummaryDto })
  summary(): Promise<AdminStatsSummaryDto> {
    return this.adminStats.summary();
  }

  @Get("series")
  @ApiOkResponse({ type: AdminStatsSeriesDto })
  series(@Query() query: AdminStatsSeriesQueryDto): Promise<AdminStatsSeriesDto> {
    return this.adminStats.series(query);
  }
}
