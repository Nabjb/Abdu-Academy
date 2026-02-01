import { S3Client } from '@aws-sdk/client-s3';

// Lazy initialization to avoid build-time errors when env vars aren't set
let r2ClientInstance: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2ClientInstance) {
    if (!process.env.R2_ACCOUNT_ID) {
      throw new Error('R2_ACCOUNT_ID is not set. Please add it to your environment variables.');
    }
    if (!process.env.R2_ACCESS_KEY_ID) {
      throw new Error('R2_ACCESS_KEY_ID is not set. Please add it to your environment variables.');
    }
    if (!process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2_SECRET_ACCESS_KEY is not set. Please add it to your environment variables.');
    }
    r2ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2ClientInstance;
}

// Export proxy that initializes on first use
export const r2Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    return getR2Client()[prop as keyof S3Client];
  },
});

export function getBucketName(): string {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error('R2_BUCKET_NAME is not set. Please add it to your environment variables.');
  }
  return process.env.R2_BUCKET_NAME;
}

// For backward compatibility - lazy getter
export const BUCKET_NAME = new Proxy({} as string, {
  get() {
    return getBucketName();
  },
  valueOf() {
    return getBucketName();
  },
  toString() {
    return getBucketName();
  },
}) as unknown as string;

// Folder structure
export const R2_FOLDERS = {
  VIDEOS: 'videos',
  IMAGES: 'images',
  RESOURCES: 'resources',
  THUMBNAILS: 'thumbnails',
} as const;
