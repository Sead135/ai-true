import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Role } from "@ii/shared";

export class MeDto {
  @ApiProperty({ format: "uuid" })
  sub!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ["admin", "client"] })
  role!: Role;

  @ApiPropertyOptional({ nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  createdAt!: Date;
}
