import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2/upload';
import { validateImageType, validateFileSize, MAX_FILE_SIZES } from '@/lib/r2/validation';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'IMAGES';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const typeValidation = validateImageType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error },
        { status: 400 }
      );
    }

    // Determine max size based on folder
    const maxSize = folder === 'THUMBNAILS' ? MAX_FILE_SIZES.THUMBNAIL : MAX_FILE_SIZES.IMAGE;

    // Validate file size
    const sizeValidation = validateFileSize(file.size, maxSize, 'Image');
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const key = await uploadFile(buffer, {
      folder: folder as 'IMAGES' | 'THUMBNAILS',
      fileName: file.name,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      key,
      fileName: file.name,
      size: file.size,
      contentType: file.type,
      url: `/api/files/${key}`, // This will be a route that generates signed URLs
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
