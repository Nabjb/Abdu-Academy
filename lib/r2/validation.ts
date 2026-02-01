/**
 * File validation utilities for R2 uploads
 */

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo', // .avi
] as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_RESOURCE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/json',
] as const;

// File size limits (in bytes)
export const MAX_FILE_SIZES = {
  VIDEO: 500 * 1024 * 1024, // 500 MB
  IMAGE: 10 * 1024 * 1024, // 10 MB
  RESOURCE: 50 * 1024 * 1024, // 50 MB
  THUMBNAIL: 5 * 1024 * 1024, // 5 MB
} as const;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file type for videos
 */
export function validateVideoType(contentType: string): ValidationResult {
  if (!ALLOWED_VIDEO_TYPES.includes(contentType as any)) {
    return {
      valid: false,
      error: `Invalid video type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type for images
 */
export function validateImageType(contentType: string): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType as any)) {
    return {
      valid: false,
      error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type for resources
 */
export function validateResourceType(contentType: string): ValidationResult {
  if (!ALLOWED_RESOURCE_TYPES.includes(contentType as any)) {
    return {
      valid: false,
      error: `Invalid resource type. Allowed types: ${ALLOWED_RESOURCE_TYPES.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSize: number,
  fileType: string
): ValidationResult {
  if (size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `${fileType} file size exceeds maximum allowed size of ${maxSizeMB} MB`,
    };
  }
  return { valid: true };
}

/**
 * Get content type from filename extension
 */
export function getContentTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    // Resources
    pdf: 'application/pdf',
    zip: 'application/zip',
    txt: 'text/plain',
    json: 'application/json',
  };
  
  return typeMap[ext || ''] || 'application/octet-stream';
}
