import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { ListPageQueryDto } from "../../common/list-page.query.dto";
import { emptyToUndefined } from "../../common/transform";

export class ListBranchesQueryDto extends ListPageQueryDto {
  @ApiPropertyOptional({ description: "Search by name, city, or address" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ format: "uuid", description: "Admin: filter by company" })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: "Filter by city" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: ["active", "inactive"] })
  @IsOptional()
  @IsIn(["active", "inactive"])
  status?: "active" | "inactive";
}
