import { PutBucketCorsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import type { AccessTokenPayload } from "../auth/auth.types.js";
import {
  type AllowedImageType,
  type PresignUploadDto,
  type PresignUploadResponseDto,
} from "./dto/presign-upload.dto.js";

const EXT: Record<AllowedImageType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly log = new Logger(UploadsService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: config.getOrThrow<string>("AWS_REGION"),
      endpoint: config.getOrThrow<string>("AWS_ENDPOINT_URL_S3"),
      credentials: {
        accessKeyId: config.getOrThrow<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: config.getOrThrow<string>("AWS_SECRET_ACCESS_KEY"),
      },
      forcePathStyle: true,
      // Recent AWS SDK embeds empty-body checksum in presigned PUTs; disable unless required.
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
    this.bucket = config.getOrThrow<string>("S3_BUCKET");
    this.endpoint = config.getOrThrow<string>("AWS_ENDPOINT_URL_S3").replace(/\/$/, "");
  }

  async onModuleInit(): Promise<void> {
    const origins = (this.config.get<string>("FRONTEND_ORIGIN") ?? "http://localhost:3001")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    try {
      await this.s3.send(
        new PutBucketCorsCommand({
          Bucket: this.bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: origins,
                AllowedMethods: ["GET", "PUT", "HEAD"],
                AllowedHeaders: ["*"],
                ExposeHeaders: ["ETag"],
                MaxAgeSeconds: 3600,
              },
            ],
          },
        }),
      );
    } catch (err) {
      this.log.warn(`CORS apply failed (uploads may fail from browser): ${String(err)}`);
    }
  }

  async presign(
    user: AccessTokenPayload,
    dto: PresignUploadDto,
  ): Promise<PresignUploadResponseDto> {
    const ext = EXT[dto.contentType];
    const folder = dto.kind === "avatar" ? "avatars" : "logos";
    const key = `${folder}/${user.sub}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = `${this.endpoint}/${this.bucket}/${key}`;

    return {
      uploadUrl,
      publicUrl,
      key,
      headers: { "Content-Type": dto.contentType },
    };
  }
}
