import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { hasUserPurchasedCourse } from '@/lib/appwrite/helpers';
import { getLesson } from '@/lib/appwrite/helpers';

/**
 * Middleware to check if user has access to a course
 */
export async function requireCourseAccess(
  request: NextRequest,
  courseId: string
): Promise<{ hasAccess: boolean; error?: NextResponse; user?: any }> {
  // Get current user
  const sessionHeader = request.headers.get('cookie');
  const sessionSecret = sessionHeader?.match(/appwrite-session=([^;]+)/)?.[1];
  const user = await getCurrentUser(sessionSecret);

  if (!user) {
    return {
      hasAccess: false,
      error: NextResponse.json(
        { error: 'Unauthorized - Please login to access this content' },
        { status: 401 }
      ),
    };
  }

  // Check if user has purchased the course
  const hasPurchased = await hasUserPurchasedCourse(user.$id, courseId);

  if (!hasPurchased) {
    return {
      hasAccess: false,
      error: NextResponse.json(
        { error: 'Access denied - You must purchase this course to view content' },
        { status: 403 }
      ),
      user,
    };
  }

  return {
    hasAccess: true,
    user,
  };
}

/**
 * Check if user can access a lesson (either purchased course or free preview)
 */
export async function requireLessonAccess(
  request: NextRequest,
  lessonId: string
): Promise<{ hasAccess: boolean; error?: NextResponse; user?: any; lesson?: any }> {
  // Get current user
  const sessionHeader = request.headers.get('cookie');
  const sessionSecret = sessionHeader?.match(/appwrite-session=([^;]+)/)?.[1];
  const user = await getCurrentUser(sessionSecret);

  // Get lesson details
  const lesson = await getLesson(lessonId);
  if (!lesson) {
    return {
      hasAccess: false,
      error: NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      ),
    };
  }

  const lessonData = lesson as any;

  // Free preview lessons are accessible to everyone
  if (lessonData.isFreePreview) {
    return {
      hasAccess: true,
      user: user || null,
      lesson: lessonData,
    };
  }

  // For non-preview lessons, require authentication and purchase
  if (!user) {
    return {
      hasAccess: false,
      error: NextResponse.json(
        { error: 'Unauthorized - Please login to access this content' },
        { status: 401 }
      ),
      lesson: lessonData,
    };
  }

  // Check if user has purchased the course
  const hasPurchased = await hasUserPurchasedCourse(user.$id, lessonData.courseId);

  if (!hasPurchased) {
    return {
      hasAccess: false,
      error: NextResponse.json(
        { error: 'Access denied - You must purchase this course to view this lesson' },
        { status: 403 }
      ),
      user,
      lesson: lessonData,
    };
  }

  return {
    hasAccess: true,
    user,
    lesson: lessonData,
  };
}
