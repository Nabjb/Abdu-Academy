import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  createProgress,
  updateProgress,
  getUserProgress,
  getLessonProgress,
} from '@/lib/appwrite/helpers';
import { z } from 'zod';

const updateProgressSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  lessonId: z.string().min(1, 'Lesson ID is required'),
  watchedSeconds: z.number().int().min(0),
  completed: z.boolean().optional(),
});

// GET /api/progress - Get user progress for a course
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required' },
        { status: 400 }
      );
    }

    const userId = auth.user!.id;

    // If lessonId is provided, get specific lesson progress
    if (lessonId) {
      const progress = await getLessonProgress(userId, lessonId) as any;
      return NextResponse.json({
        success: true,
        progress: progress
          ? {
              progressId: progress.$id,
              userId: progress.userId,
              courseId: progress.courseId,
              lessonId: progress.lessonId,
              completed: progress.completed,
              watchedSeconds: progress.watchedSeconds,
              lastWatchedAt: progress.lastWatchedAt,
            }
          : null,
      });
    }

    // Get all progress for the course
    const progressData = await getUserProgress(userId, courseId);

    // Calculate overall course progress
    const completedLessons = progressData.documents.filter(
      (p: any) => p.completed
    ).length;
    const totalWatchTime = progressData.documents.reduce(
      (sum: number, p: any) => sum + (p.watchedSeconds || 0),
      0
    );

    return NextResponse.json({
      success: true,
      progress: progressData.documents.map((p: any) => ({
        progressId: p.$id,
        userId: p.userId,
        courseId: p.courseId,
        lessonId: p.lessonId,
        completed: p.completed,
        watchedSeconds: p.watchedSeconds,
        lastWatchedAt: p.lastWatchedAt,
      })),
      summary: {
        completedLessons,
        totalWatchTime,
        totalLessonsTracked: progressData.documents.length,
      },
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/progress - Update or create progress
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const validation = updateProgressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { courseId, lessonId, watchedSeconds, completed } = validation.data;
    const userId = auth.user!.id;

    // Check if progress already exists
    const existingProgress = await getLessonProgress(userId, lessonId) as any;

    let progress: any;
    if (existingProgress) {
      // Update existing progress
      progress = await updateProgress(existingProgress.$id, {
        watchedSeconds,
        completed: completed ?? existingProgress.completed,
      });
    } else {
      // Create new progress
      progress = await createProgress({
        userId,
        courseId,
        lessonId,
        watchedSeconds,
        completed: completed ?? false,
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        progressId: progress.$id,
        userId: progress.userId,
        courseId: progress.courseId,
        lessonId: progress.lessonId,
        completed: progress.completed,
        watchedSeconds: progress.watchedSeconds,
        lastWatchedAt: progress.lastWatchedAt,
      },
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
