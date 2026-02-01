import { NextRequest, NextResponse } from 'next/server';
import { reorderLessons, getModule, getCourse } from '@/lib/appwrite/helpers';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { z } from 'zod';

const reorderSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  lessonOrders: z.array(
    z.object({
      lessonId: z.string().min(1),
      order: z.number().int().min(0),
    })
  ).min(1, 'At least one lesson order is required'),
});

export async function PUT(request: NextRequest) {
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
    const validation = reorderSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { moduleId, lessonOrders } = validation.data;

    // Verify module exists and get course
    const module = await getModule(moduleId);
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Verify user owns the course
    const course = await getCourse((module as any).courseId);
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

    // Reorder lessons
    const result = await reorderLessons(moduleId, lessonOrders);

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
        resources: typeof doc.resources === 'string' 
          ? JSON.parse(doc.resources) 
          : doc.resources || [],
        createdAt: doc.$createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Reorder lessons error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reorder lessons' },
      { status: 500 }
    );
  }
}
