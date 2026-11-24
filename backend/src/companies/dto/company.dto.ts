import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CompanyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiProperty()
  website!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  createdAt!: Date;
}
