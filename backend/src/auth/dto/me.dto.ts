import { ApiProperty } from "@nestjs/swagger";
import type { Role } from "@ii/shared";

export class MeDto {
  @ApiProperty({ format: "uuid" })
  sub!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ["admin", "client"] })
  role!: Role;
}
