import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { hasUserPurchasedCourse } from '@/lib/appwrite/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Get current user
    const sessionHeader = request.headers.get('cookie');
    const sessionSecret = sessionHeader?.match(/appwrite-session=([^;]+)/)?.[1];
    const user = await getCurrentUser(sessionSecret);

    if (!user) {
      return NextResponse.json(
        { 
          hasAccess: false,
          error: 'Unauthorized - Please login to access this course' 
        },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Check if user has purchased the course
    const hasPurchased = await hasUserPurchasedCourse(user.$id, courseId);

    return NextResponse.json({
      hasAccess: hasPurchased,
      courseId,
      userId: user.$id,
    });
  } catch (error: any) {
    console.error('Purchase verification error:', error);
    return NextResponse.json(
      { 
        hasAccess: false,
        error: error.message || 'Failed to verify purchase' 
      },
      { status: 500 }
    );
  }
}
