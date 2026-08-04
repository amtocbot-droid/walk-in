import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3: S3Client | null = null;

export function getS3(): S3Client | null {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET;
  if (!region || !bucket) return null;

  if (!s3) {
    s3 = new S3Client({
      region,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
          }
        : undefined,
    });
  }

  return s3;
}

export function getBucket(): string | null {
  return process.env.S3_BUCKET ?? null;
}

export async function uploadAsset(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType: string
): Promise<string> {
  const client = getS3();
  const bucket = getBucket();
  if (!client || !bucket) {
    throw new Error("S3 is not configured");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function getAssetUrl(key: string, expiresIn = 3600): Promise<string> {
  const client = getS3();
  const bucket = getBucket();
  if (!client || !bucket) {
    throw new Error("S3 is not configured");
  }

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );
}

export function getPublicAssetUrl(key: string): string {
  const bucket = getBucket();
  const region = process.env.AWS_REGION;
  if (!bucket || !region) {
    throw new Error("S3 is not configured");
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
