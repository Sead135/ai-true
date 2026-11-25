import { Module } from "@nestjs/common";
import { BranchesModule } from "../branches/branches.module.js";
import { ReviewsModule } from "../reviews/reviews.module.js";
import { AdminStatsController } from "./admin-stats.controller.js";
import { AdminStatsService } from "./admin-stats.service.js";
import { MockStatsSource } from "./mock-stats-source.js";
import { StatsController } from "./stats.controller.js";
import { StatsService } from "./stats.service.js";

@Module({
  imports: [BranchesModule, ReviewsModule],
  controllers: [StatsController, AdminStatsController],
  providers: [StatsService, AdminStatsService, MockStatsSource],
  exports: [StatsService],
})
export class StatsModule {}
