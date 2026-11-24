import { Module } from "@nestjs/common";
import { BranchesModule } from "../branches/branches.module";
import { ReviewsModule } from "../reviews/reviews.module";
import { MockStatsSource } from "./mock-stats-source";
import { STATS_SOURCE } from "./stats-source";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
  imports: [BranchesModule, ReviewsModule],
  controllers: [StatsController],
  providers: [
    StatsService,
    // ponytail: swap MockStatsSource → HttpStatsSource when real API lands
    { provide: STATS_SOURCE, useClass: MockStatsSource },
  ],
  exports: [StatsService],
})
export class StatsModule {}
