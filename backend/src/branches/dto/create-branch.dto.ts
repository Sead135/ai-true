import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
  ValidateIf,
} from "class-validator";
import { IsAvatarValue } from "../../common/is-avatar.decorator.js";

export class CreateBranchDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  companyId!: string;

  @ApiProperty({ example: "Филиал на Баумана" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: "ул. Баумана, 5" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "Казань" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "+79997654321" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: "http(s) image URL or data:image/*;base64,… (max ~350KB)",
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== "")
  @IsAvatarValue()
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: "https://example.com/baumana" })
  @IsOptional()
  @ValidateIf((_, v) => typeof v === "string" && v.length > 0)
  @IsUrl({ require_protocol: true })
  website?: string;

  @ApiPropertyOptional({ example: "baumana@example.com" })
  @IsOptional()
  @ValidateIf((_, v) => typeof v === "string" && v.length > 0)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "Кофейня" })
  @IsOptional()
  @IsString()
  businessCategory?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
