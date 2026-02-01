import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserProgress, getLessonsByCourse } from '@/lib/appwrite/helpers';

// GET /api/progress/[courseId] - Get detailed progress for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    const { courseId } = await params;
    const userId = auth.user!.id;

    // Get all lessons for the course
    const lessons = await getLessonsByCourse(courseId);

    // Get user progress for the course
    const progressData = await getUserProgress(userId, courseId);

    // Create a map of lesson progress
    const progressMap = new Map();
    progressData.documents.forEach((p: any) => {
      progressMap.set(p.lessonId, {
        completed: p.completed,
        watchedSeconds: p.watchedSeconds,
        lastWatchedAt: p.lastWatchedAt,
      });
    });

    // Calculate total duration of all lessons
    const totalDuration = lessons.documents.reduce(
      (sum: number, lesson: any) => sum + (lesson.duration || 0),
      0
    );

    // Calculate watched duration
    const watchedDuration = progressData.documents.reduce(
      (sum: number, p: any) => sum + (p.watchedSeconds || 0),
      0
    );

    // Calculate completed lessons
    const completedLessons = progressData.documents.filter(
      (p: any) => p.completed
    ).length;

    // Calculate completion percentage
    const completionPercentage =
      lessons.documents.length > 0
        ? Math.round((completedLessons / lessons.documents.length) * 100)
        : 0;

    // Find the last watched lesson
    const sortedProgress = [...progressData.documents].sort(
      (a: any, b: any) =>
        new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
    );
    const lastWatchedLessonId = (sortedProgress[0] as any)?.lessonId || null;

    // Find the next incomplete lesson
    const lessonsWithProgress = lessons.documents
      .map((lesson: any) => ({
        lessonId: lesson.$id,
        order: lesson.order,
        completed: progressMap.get(lesson.$id)?.completed || false,
      }))
      .sort((a: any, b: any) => a.order - b.order);

    const nextLessonId =
      lessonsWithProgress.find((l: any) => !l.completed)?.lessonId || null;

    return NextResponse.json({
      success: true,
      courseProgress: {
        courseId,
        totalLessons: lessons.documents.length,
        completedLessons,
        completionPercentage,
        totalDuration,
        watchedDuration,
        lastWatchedLessonId,
        nextLessonId,
        lessonProgress: lessons.documents.map((lesson: any) => ({
          lessonId: lesson.$id,
          title: lesson.title,
          duration: lesson.duration,
          order: lesson.order,
          completed: progressMap.get(lesson.$id)?.completed || false,
          watchedSeconds: progressMap.get(lesson.$id)?.watchedSeconds || 0,
          lastWatchedAt: progressMap.get(lesson.$id)?.lastWatchedAt || null,
        })),
      },
    });
  } catch (error: any) {
    console.error('Get course progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course progress' },
      { status: 500 }
    );
  }
}
