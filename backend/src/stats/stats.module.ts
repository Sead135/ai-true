import { Module } from "@nestjs/common";
import { BranchesModule } from "../branches/branches.module";
import { ReviewsModule } from "../reviews/reviews.module";
import { AdminStatsController } from "./admin-stats.controller";
import { AdminStatsService } from "./admin-stats.service";
import { MockStatsSource } from "./mock-stats-source";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
  imports: [BranchesModule, ReviewsModule],
  controllers: [StatsController, AdminStatsController],
  providers: [StatsService, AdminStatsService, MockStatsSource],
  exports: [StatsService],
})
export class StatsModule {}
