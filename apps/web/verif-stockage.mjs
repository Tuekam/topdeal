import { S3Client, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

for (const Bucket of [process.env.S3_BUCKET_ANNONCES, process.env.S3_BUCKET_IDENTITES]) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket }));
    console.log("Créé :", Bucket);
  }
  console.log("OK bucket", Bucket);
}