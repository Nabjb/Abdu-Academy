import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/r2/upload';
import { requireAuth } from '@/lib/auth/middleware';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Check authentication
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    // Check if user is instructor or admin
    if (auth.user?.role !== 'instructor' && auth.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Only instructors and admins can delete files' },
        { status: 403 }
      );
    }

    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // Delete file from R2
    await deleteFile(key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
