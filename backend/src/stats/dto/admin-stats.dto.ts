import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn } from "class-validator";

export const ADMIN_METRICS = ["companies", "branches", "views", "users", "reviews"] as const;
export type AdminMetric = (typeof ADMIN_METRICS)[number];

export class AdminStatsSummaryDto {
  @ApiProperty({ example: 2 })
  companies!: number;

  @ApiProperty({ example: 3 })
  branches!: number;

  @ApiProperty({ example: 12000 })
  views!: number;

  @ApiProperty({ example: 4 })
  users!: number;

  @ApiProperty({ example: 120 })
  reviews!: number;
}

export class AdminStatsSeriesQueryDto {
  @ApiProperty({ enum: ADMIN_METRICS })
  @IsIn(ADMIN_METRICS)
  metric!: AdminMetric;

  @ApiProperty({ example: "2026-10-01" })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: "2026-10-31" })
  @IsDateString()
  to!: string;
}

export class AdminStatsSeriesPointDto {
  @ApiProperty({ example: "2026-10-15" })
  date!: string;

  @ApiProperty({ example: 2 })
  value!: number;
}

export class AdminStatsSeriesDto {
  @ApiProperty({ enum: ADMIN_METRICS })
  metric!: AdminMetric;

  @ApiProperty({ type: AdminStatsSeriesPointDto, isArray: true })
  series!: AdminStatsSeriesPointDto[];
}
