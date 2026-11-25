import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { ListPageQueryDto } from "../../common/list-page.query.dto.js";

export class ListCompaniesQueryDto extends ListPageQueryDto {
  @ApiPropertyOptional({ description: "Search by name, city, or email" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "Filter by city" })
  @IsOptional()
  @IsString()
  city?: string;
}
