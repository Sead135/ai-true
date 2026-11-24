import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from "class-validator";
import { IsImageUrl } from "../../common/is-image-url.decorator";

export class CreateBranchDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  companyId!: string;

  @ApiProperty({ example: "Филиал на Баумана" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "ул. Баумана, 5" })
  @IsString()
  @MinLength(1)
  address!: string;

  @ApiProperty({ example: "Казань" })
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiProperty({ example: "+79997654321" })
  @IsString()
  @MinLength(5)
  phone!: string;

  @ApiPropertyOptional({ example: "https://cdn.example.com/branch.png" })
  @IsOptional()
  @IsImageUrl()
  logoUrl?: string;

  @ApiProperty({ example: "https://example.com/baumana" })
  @IsUrl({ require_protocol: true })
  website!: string;

  @ApiProperty({ example: "baumana@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Кофейня" })
  @IsString()
  @MinLength(1)
  businessCategory!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
