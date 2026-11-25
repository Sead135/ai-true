import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { GetReviewsQueryDto } from "./dto/get-reviews.query.dto.js";
import { ReviewsPageDto } from "./dto/review.dto.js";
import { ReviewsService } from "./reviews.service.js";

@ApiTags("reviews")
@ApiBearerAuth()
@ApiCookieAuth("access_token")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @Roles("admin", "client")
  @ApiOkResponse({ type: ReviewsPageDto })
  list(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetReviewsQueryDto,
  ): Promise<ReviewsPageDto> {
    return this.reviews.list(req.user, query);
  }
}
