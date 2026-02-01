import { NextRequest, NextResponse } from 'next/server';
import { requireLessonAccess } from '@/lib/auth/access-control';
import { getSignedDownloadUrl } from '@/lib/r2/signed-urls';
import { R2_FOLDERS } from '@/lib/r2/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check lesson access
    const access = await requireLessonAccess(request, id);
    
    if (!access.hasAccess) {
      return access.error!;
    }

    const lesson = access.lesson!;

    // Get video URL from lesson
    if (!lesson.videoUrl) {
      return NextResponse.json(
        { error: 'Video not available for this lesson' },
        { status: 404 }
      );
    }

    // Extract key from videoUrl (assuming format: videos/filename.mp4)
    // If videoUrl is already a full URL, we need to extract the key
    let videoKey = lesson.videoUrl;
    
    // If it's a full URL, extract the key
    if (videoKey.startsWith('http')) {
      // Extract key from URL (e.g., https://r2.../videos/file.mp4 -> videos/file.mp4)
      const urlParts = videoKey.split('/');
      const videosIndex = urlParts.findIndex((part: string) => part === 'videos');
      if (videosIndex !== -1) {
        videoKey = urlParts.slice(videosIndex).join('/');
      }
    } else if (!videoKey.startsWith('videos/')) {
      // If it's just a filename, prepend videos/
      videoKey = `${R2_FOLDERS.VIDEOS}/${videoKey}`;
    }

    // Generate signed URL (valid for 1 hour)
    const signedUrl = await getSignedDownloadUrl(videoKey, 3600); // 1 hour expiry

    return NextResponse.json({
      success: true,
      videoUrl: signedUrl,
      expiresIn: 3600,
    });
  } catch (error: any) {
    console.error('Video access error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate video URL' },
      { status: 500 }
    );
  }
}
