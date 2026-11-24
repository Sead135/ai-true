import { ApiProperty } from "@nestjs/swagger";

/** Public auth response — tokens live in httpOnly cookies, not in the body. */
export class AuthSessionDto {
  @ApiProperty({ example: "15m", description: "Access token TTL (as configured)" })
  expiresIn!: string;
}
