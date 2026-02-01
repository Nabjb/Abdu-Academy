/**
 * Example API route for file uploads to R2
 * 
 * This is a reference implementation. Create actual routes in:
 * - app/api/upload/video/route.ts
 * - app/api/upload/image/route.ts
 * - app/api/upload/resource/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2/upload';
import { validateVideoType, validateImageType, validateFileSize, MAX_FILE_SIZES } from '@/lib/r2/validation';

// Example: Video upload endpoint
export async function POST_VIDEO_EXAMPLE(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const typeValidation = validateVideoType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json({ error: typeValidation.error }, { status: 400 });
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size, MAX_FILE_SIZES.VIDEO, 'Video');
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const key = await uploadFile(buffer, {
      folder: 'VIDEOS',
      fileName: file.name,
      contentType: file.type,
    });

    return NextResponse.json({ 
      success: true, 
      key,
      url: `/api/files/${key}`, // This would be a route that generates signed URLs
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Example: Image upload endpoint
export async function POST_IMAGE_EXAMPLE(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const typeValidation = validateImageType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json({ error: typeValidation.error }, { status: 400 });
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size, MAX_FILE_SIZES.IMAGE, 'Image');
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const key = await uploadFile(buffer, {
      folder: 'IMAGES',
      fileName: file.name,
      contentType: file.type,
    });

    return NextResponse.json({ 
      success: true, 
      key,
      url: `/api/files/${key}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
