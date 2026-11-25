import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Role } from "@ii/shared";

export class UserDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ enum: ["admin", "client"] })
  role!: Role;

  @ApiPropertyOptional({ format: "uuid", nullable: true })
  companyId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  companyName!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class UsersPageDto {
  @ApiProperty({ type: UserDto, isArray: true })
  items!: UserDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
