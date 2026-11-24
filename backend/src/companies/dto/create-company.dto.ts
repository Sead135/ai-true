import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from "class-validator";
import { IsImageUrl } from "../../common/is-image-url.decorator";

export class CreateCompanyDto {
  @ApiProperty({ example: "Кофейня «У реки»" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "ул. Ленина, 10" })
  @IsString()
  @MinLength(1)
  address!: string;

  @ApiProperty({ example: "Казань" })
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiProperty({ example: "+79991234567" })
  @IsString()
  @MinLength(5)
  phone!: string;

  @ApiProperty({ example: "Сеть кофеен" })
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiPropertyOptional({ example: "https://cdn.example.com/logo.png" })
  @IsOptional()
  @IsImageUrl()
  logoUrl?: string;

  @ApiProperty({ example: "https://example.com" })
  @IsUrl({ require_protocol: true })
  website!: string;

  @ApiProperty({ example: "hello@example.com" })
  @IsEmail()
  email!: string;
}
