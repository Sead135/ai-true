import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class RefreshDto {
  @ApiPropertyOptional({
    description: "Optional if refresh_token cookie is present (useful for Swagger)",
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  refreshToken?: string;
}
