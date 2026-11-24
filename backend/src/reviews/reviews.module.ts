import { Module } from "@nestjs/common";
import { BranchesModule } from "../branches/branches.module";
import { MockReviewsSource } from "./mock-reviews-source";
import { REVIEWS_SOURCE } from "./reviews-source";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  imports: [BranchesModule],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    // ponytail: swap MockReviewsSource → HttpReviewsSource when real API lands
    { provide: REVIEWS_SOURCE, useClass: MockReviewsSource },
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
