import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, Max, Min } from "class-validator";

export const UPLOAD_KINDS = ["avatar", "logo"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** ~5 MiB — avatars/logos stay small; raise if product needs larger assets. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export class PresignUploadDto {
  @ApiProperty({ enum: UPLOAD_KINDS })
  @IsIn(UPLOAD_KINDS)
  kind!: UploadKind;

  @ApiProperty({ enum: ALLOWED_IMAGE_TYPES })
  @IsIn(ALLOWED_IMAGE_TYPES)
  contentType!: AllowedImageType;

  @ApiProperty({ minimum: 1, maximum: MAX_UPLOAD_BYTES })
  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES)
  contentLength!: number;
}

export class PresignUploadResponseDto {
  @ApiProperty()
  uploadUrl!: string;

  @ApiProperty()
  publicUrl!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty({ type: "object", additionalProperties: { type: "string" } })
  headers!: Record<string, string>;
}
