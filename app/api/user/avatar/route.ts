import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/middleware';
import { uploadFile } from '@/lib/r2/upload';
import { validateImageType, validateFileSize, MAX_FILE_SIZES } from '@/lib/r2/validation';
import { updateUser } from '@/lib/appwrite/helpers';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();

    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const typeValidation = validateImageType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error },
        { status: 400 }
      );
    }

    // Validate file size (use thumbnail size limit for avatars)
    const sizeValidation = validateFileSize(file.size, MAX_FILE_SIZES.THUMBNAIL, 'Avatar');
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
      folder: 'IMAGES',
      fileName: `avatars/${auth.user.id}-${Date.now()}`,
      contentType: file.type,
    });

    // Update user profile with avatar URL
    await updateUser(auth.user.id, {
      avatar: `/api/files/${key}`,
    });

    return NextResponse.json({
      success: true,
      avatarUrl: `/api/files/${key}`,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
