import { ApiProperty } from "@nestjs/swagger";

export class ReviewDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  branchId!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  rating!: number;

  @ApiProperty()
  text!: string;

  @ApiProperty({ example: "Анна К." })
  authorName!: string;

  @ApiProperty({ enum: ["new", "processed"] })
  status!: "new" | "processed";

  @ApiProperty()
  reviewedOn!: Date;

  @ApiProperty()
  createdAt!: Date;
}

export class ReviewsPageDto {
  @ApiProperty({ type: ReviewDto, isArray: true })
  items!: ReviewDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
