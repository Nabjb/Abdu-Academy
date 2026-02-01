import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2/upload';
import { validateResourceType, validateFileSize, MAX_FILE_SIZES } from '@/lib/r2/validation';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    // Check if user is instructor or admin
    if (auth.user?.role !== 'instructor' && auth.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Only instructors and admins can upload resources' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const typeValidation = validateResourceType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error },
        { status: 400 }
      );
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size, MAX_FILE_SIZES.RESOURCE, 'Resource');
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
      folder: 'RESOURCES',
      fileName: file.name,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      key,
      fileName: file.name,
      size: file.size,
      contentType: file.type,
      url: `/api/files/${key}`,
    });
  } catch (error: any) {
    console.error('Resource upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resource' },
      { status: 500 }
    );
  }
}
