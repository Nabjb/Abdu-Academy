import { NextRequest, NextResponse } from 'next/server';
import { createLesson, getLessonsByModule, getLessonsByCourse } from '@/lib/appwrite/helpers';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getModule, getCourse } from '@/lib/appwrite/helpers';
import { z } from 'zod';
import { LessonResource } from '@/types';

const createLessonSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).default(0),
  order: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().default(false),
  resources: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
    })
  ).optional().default([]),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const courseId = searchParams.get('courseId');

    if (!moduleId && !courseId) {
      return NextResponse.json(
        { error: 'moduleId or courseId query parameter is required' },
        { status: 400 }
      );
    }

    let result;
    if (moduleId) {
      result = await getLessonsByModule(moduleId);
    } else {
      result = await getLessonsByCourse(courseId!);
    }
    
    return NextResponse.json({
      lessons: result.documents.map((doc: any) => ({
        lessonId: doc.$id,
        moduleId: doc.moduleId,
        courseId: doc.courseId,
        title: doc.title,
        description: doc.description,
        videoUrl: doc.videoUrl,
        duration: doc.duration,
        order: doc.order,
        isFreePreview: doc.isFreePreview,
        resources: typeof doc.resources === 'string' ? JSON.parse(doc.resources) : doc.resources || [],
        createdAt: doc.$createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Get lessons error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const sessionHeader = request.headers.get('cookie');
    const sessionSecret = sessionHeader?.match(/appwrite-session=([^;]+)/)?.[1];
    const user = await getCurrentUser(sessionSecret);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createLessonSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { moduleId, courseId, title, description, videoUrl, duration, order, isFreePreview, resources } = validation.data;

    // Verify user owns the course
    const course = await getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if ((course as any).instructorId !== user.$id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - You do not own this course' },
        { status: 403 }
      );
    }

    // Verify module belongs to course
    const module = await getModule(moduleId);
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    if ((module as any).courseId !== courseId) {
      return NextResponse.json(
        { error: 'Module does not belong to this course' },
        { status: 400 }
      );
    }

    // Get current max order if order not provided
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const existingLessons = await getLessonsByModule(moduleId);
      lessonOrder = existingLessons.documents.length;
    }

    // Create lesson (resources stored as JSON string in Appwrite)
    const lesson = await createLesson({
      moduleId,
      courseId,
      title,
      description: description || '',
      videoUrl: videoUrl || '',
      duration: duration || 0,
      order: lessonOrder,
      isFreePreview: isFreePreview || false,
      resources: JSON.stringify(resources || []) as unknown as LessonResource[],
    });

    return NextResponse.json({
      lesson: {
        lessonId: lesson.$id,
        moduleId: (lesson as any).moduleId,
        courseId: (lesson as any).courseId,
        title: (lesson as any).title,
        description: (lesson as any).description,
        videoUrl: (lesson as any).videoUrl,
        duration: (lesson as any).duration,
        order: (lesson as any).order,
        isFreePreview: (lesson as any).isFreePreview,
        resources: typeof (lesson as any).resources === 'string' 
          ? JSON.parse((lesson as any).resources) 
          : (lesson as any).resources || [],
        createdAt: lesson.$createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create lesson error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
