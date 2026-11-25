import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { IsAvatarValue } from "../../common/is-avatar.decorator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Иван Петров" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: "http(s) image URL or data:image/*;base64,… (max ~350KB)",
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== "")
  @IsAvatarValue()
  avatarUrl?: string | null;
}
