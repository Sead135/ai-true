import { ApiProperty } from "@nestjs/swagger";

export class StatsTotalsDto {
  @ApiProperty({ example: 4200 })
  views!: number;

  @ApiProperty({ example: 310 })
  websiteClicks!: number;

  @ApiProperty({ example: 95 })
  calls!: number;

  @ApiProperty({ example: 180 })
  routes!: number;

  @ApiProperty({ example: 4.3, description: "Weighted by daily review counts" })
  avgRating!: number;

  @ApiProperty({ example: 42 })
  reviewsCount!: number;
}

export class StatsSeriesPointDto extends StatsTotalsDto {
  @ApiProperty({ example: "2026-10-15" })
  date!: string;
}

export class StatsResponseDto {
  @ApiProperty({ type: StatsTotalsDto })
  totals!: StatsTotalsDto;

  @ApiProperty({ type: StatsSeriesPointDto, isArray: true })
  series!: StatsSeriesPointDto[];
}
