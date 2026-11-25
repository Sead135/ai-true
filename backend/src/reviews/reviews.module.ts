import { Module } from "@nestjs/common";
import { BranchesModule } from "../branches/branches.module.js";
import { MockReviewsSource } from "./mock-reviews-source.js";
import { ReviewsController } from "./reviews.controller.js";
import { ReviewsService } from "./reviews.service.js";

@Module({
  imports: [BranchesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, MockReviewsSource],
  exports: [ReviewsService],
})
export class ReviewsModule {}
