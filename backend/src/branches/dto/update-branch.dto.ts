import { ApiPropertyOptional, PartialType, OmitType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateBranchDto } from "./create-branch.dto.js";

export class UpdateBranchDto extends PartialType(
  OmitType(CreateBranchDto, ["companyId"] as const),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
