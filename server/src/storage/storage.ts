import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListBucketsCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@core/config.js";
import { STORAGE } from "@core/constants.js";

const s3 = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  }
});

export async function createUploadUrl(
  key: string,
  contentType: string,
  expiresIn = STORAGE.presignedExpiresSeconds
) {
  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    ContentType: contentType
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return { url, key, expiresIn };
}

export async function createStreamUrl(
  key: string,
  expiresIn = STORAGE.presignedExpiresSeconds
) {
  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: key
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return { url, key, expiresIn };
}

export async function headObject(key: string) {
  const command = new HeadObjectCommand({
    Bucket: config.s3.bucket,
    Key: key
  });

  const result = await s3.send(command);

  return {
    contentType: result.ContentType ?? null,
    contentLength: result.ContentLength ?? null
  };
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: config.s3.bucket, Key: key }));
}

export async function checkS3Connection() {
  await s3.send(new ListBucketsCommand({}));
}

export function toPublicUrl(key: string) {
  if (!config.s3.publicUrl) return null;
  return `${config.s3.publicUrl.replace(/\/$/, "")}/${key}`;
}
