import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BranchDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  phone!: string;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiProperty()
  website!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  businessCategory!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;
}

export class BranchesPageDto {
  @ApiProperty({ type: BranchDto, isArray: true })
  items!: BranchDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
