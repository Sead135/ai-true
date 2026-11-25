import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl, MinLength, ValidateIf } from "class-validator";
import { IsAvatarValue } from "../../common/is-avatar.decorator.js";

export class CreateCompanyDto {
  @ApiProperty({ example: "Кофейня «У реки»" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: "ул. Ленина, 10" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "Казань" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "+79991234567" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "Сеть кофеен" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: "http(s) image URL or data:image/*;base64,… (max ~350KB)",
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== "")
  @IsAvatarValue()
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: "https://example.com" })
  @IsOptional()
  @ValidateIf((_, v) => typeof v === "string" && v.length > 0)
  @IsUrl({ require_protocol: true })
  website?: string;

  @ApiPropertyOptional({ example: "hello@example.com" })
  @IsOptional()
  @ValidateIf((_, v) => typeof v === "string" && v.length > 0)
  @IsEmail()
  email?: string;
}
