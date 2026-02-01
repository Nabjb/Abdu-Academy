import { r2Client, getBucketName, R2_FOLDERS } from './client';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  folder?: keyof typeof R2_FOLDERS;
  fileName?: string;
  contentType?: string;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadFile(
  file: Buffer | Uint8Array,
  options: UploadOptions = {}
): Promise<string> {
  const { folder = 'IMAGES', fileName, contentType } = options;
  
  // Generate unique filename if not provided
  const fileId = fileName || `${uuidv4()}-${Date.now()}`;
  const folderPath = R2_FOLDERS[folder];
  const key = `${folderPath}/${fileId}`;

  try {
    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: file,
      ContentType: contentType || 'application/octet-stream',
    });

    await r2Client.send(command);
    
    // Return the full path/key for reference
    return key;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a file from a stream (useful for large files)
 */
export async function uploadFileFromStream(
  stream: ReadableStream,
  options: UploadOptions = {}
): Promise<string> {
  const { folder = 'IMAGES', fileName, contentType } = options;
  
  const fileId = fileName || `${uuidv4()}-${Date.now()}`;
  const folderPath = R2_FOLDERS[folder];
  const key = `${folderPath}/${fileId}`;

  try {
    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
    
    return uploadFile(buffer, { folder, fileName: fileId, contentType });
  } catch (error) {
    console.error('Error uploading stream to R2:', error);
    throw new Error(`Failed to upload stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete multiple files from R2
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  await Promise.all(keys.map(key => deleteFile(key)));
}
