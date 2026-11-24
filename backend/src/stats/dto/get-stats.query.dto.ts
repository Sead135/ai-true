import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class GetStatsQueryDto {
  @ApiProperty({ example: "2026-10-01", description: "Inclusive start (YYYY-MM-DD)" })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: "2026-10-31", description: "Inclusive end (YYYY-MM-DD)" })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ format: "uuid", description: "Omit to aggregate all accessible branches" })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
