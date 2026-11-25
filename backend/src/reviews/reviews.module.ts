import { Module } from "@nestjs/common";
import { BranchesModule } from "../branches/branches.module";
import { MockReviewsSource } from "./mock-reviews-source";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  imports: [BranchesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, MockReviewsSource],
  exports: [ReviewsService],
})
export class ReviewsModule {}
