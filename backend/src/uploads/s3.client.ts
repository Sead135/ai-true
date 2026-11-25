import { S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

export function createS3Client(config: ConfigService): S3Client {
  return new S3Client({
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
}
