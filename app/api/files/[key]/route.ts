import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl } from '@/lib/r2/signed-urls';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    
    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // Generate signed URL (1 hour expiry)
    const signedUrl = await getSignedDownloadUrl(key, 3600);

    // Redirect to signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error('File access error:', error);
    return NextResponse.json(
      { error: 'Failed to generate file URL' },
      { status: 500 }
    );
  }
}
