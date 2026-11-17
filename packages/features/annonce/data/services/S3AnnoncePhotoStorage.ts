import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import type { AnnoncePhotoInput } from "../../core/models/AnnoncePhotoInput";
import type { StoredAnnoncePhoto } from "../../core/models/StoredAnnoncePhoto";
import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";

const READ_URL_TTL_SECONDS = 300;
const EXTENSIONS_BY_TYPE: Record<AnnoncePhotoInput["contentType"], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
let clientInstance: S3Client | null = null;

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for announcement photo storage.`);
  return value;
}

function getBucketName(): string {
  return requiredEnvironmentVariable("S3_BUCKET_ANNONCES");
}

function getClient(): S3Client {
  if (clientInstance) return clientInstance;

  clientInstance = new S3Client({
    endpoint: requiredEnvironmentVariable("S3_ENDPOINT"),
    // The S3 protocol requires a region; MinIO uses this default when none is configured.
    region: process.env.S3_REGION?.trim() || "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: requiredEnvironmentVariable("S3_ACCESS_KEY"),
      secretAccessKey: requiredEnvironmentVariable("S3_SECRET_KEY"),
    },
  });
  return clientInstance;
}

function hasValidSignature(photo: AnnoncePhotoInput): boolean {
  const bytes = photo.content;
  switch (photo.contentType) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
        bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
        bytes[6] === 0x1a && bytes[7] === 0x0a
      );
    case "image/webp":
      return (
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
        bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 &&
        bytes[10] === 0x42 && bytes[11] === 0x50
      );
  }
}

export class S3AnnoncePhotoStorage implements AnnoncePhotoStorage {
  async store(photo: AnnoncePhotoInput): Promise<StoredAnnoncePhoto> {
    if (!hasValidSignature(photo)) {
      throw new Error("Announcement photo content does not match its image type.");
    }

    const key = `annonces/${randomUUID()}.${EXTENSIONS_BY_TYPE[photo.contentType]}`;
    await getClient().send(new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: photo.content,
      ContentType: photo.contentType,
    }));

    return {
      key,
      originalName: photo.originalName,
      contentType: photo.contentType,
      size: photo.content.byteLength,
    };
  }

  async createReadUrl(key: string): Promise<string> {
    if (!/^annonces\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(key)) {
      throw new Error("Invalid announcement photo key.");
    }

    return getSignedUrl(
      getClient(),
      new GetObjectCommand({
        Bucket: getBucketName(),
        Key: key,
      }),
      { expiresIn: READ_URL_TTL_SECONDS },
    );
  }

  async delete(key: string): Promise<void> {
    if (!/^annonces\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(key)) {
      throw new Error("Invalid announcement photo key.");
    }

    await getClient().send(new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }));
  }
}
