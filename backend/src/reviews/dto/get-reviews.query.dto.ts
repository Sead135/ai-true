import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

export class GetReviewsQueryDto {
  @ApiPropertyOptional({ example: "2026-10-01" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: "2026-10-31" })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ enum: ["new", "processed"] })
  @IsOptional()
  @IsIn(["new", "processed"])
  status?: "new" | "processed";
}
