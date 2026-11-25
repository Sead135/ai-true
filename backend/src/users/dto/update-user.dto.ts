import { ApiPropertyOptional } from "@nestjs/swagger";
import type { Role } from "../../auth/auth.types";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { IsAvatarValue } from "../../common/is-avatar.decorator";

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== "")
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== "")
  @IsAvatarValue()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ enum: ["admin", "client"] })
  @IsOptional()
  @IsIn(["admin", "client"])
  role?: Role;

  @ApiPropertyOptional({ format: "uuid", nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUUID()
  companyId?: string | null;

  @ApiPropertyOptional({ minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
