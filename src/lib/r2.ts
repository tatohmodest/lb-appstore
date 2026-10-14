import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function r2() {
  client ??= new S3Client({
    region: "auto",
    endpoint: process.env.R2_S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(EXT);

export const R2_PREFIX = process.env.R2_PREFIX || "lbstore";

/**
 * Public URL for a stored key. With R2_PUBLIC_URL set (bucket has public
 * access / a custom domain) files are served straight from Cloudflare;
 * otherwise they stream through our own /media route.
 */
export function publicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return base ? `${base}/${key}` : `/media/${key}`;
}

export async function getFromR2(key: string) {
  return r2().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
}

/** Uploads bytes to R2 under `${R2_PREFIX}/${folder}/` and returns the public URL. */
export async function uploadToR2(
  body: Uint8Array,
  contentType: string,
  folder: string,
): Promise<string> {
  const ext = EXT[contentType] ?? "bin";
  const key = `${R2_PREFIX}/${folder}/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await r2().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return publicUrl(key);
}
