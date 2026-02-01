import { NextRequest, NextResponse } from 'next/server';
import { getLesson, updateLesson, deleteLesson, getCourse } from '@/lib/appwrite/helpers';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { z } from 'zod';

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().optional(),
  resources: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
    })
  ).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await getLesson(id);
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

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
    });
  } catch (error: any) {
    console.error('Get lesson error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const lesson = await getLesson(id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Verify user owns the course
    const course = await getCourse((lesson as any).courseId);
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

    const body = await request.json();
    const validation = updateLessonSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updateData: any = { ...validation.data };
    // Convert resources array to JSON string if provided
    if (updateData.resources !== undefined) {
      updateData.resources = JSON.stringify(updateData.resources);
    }

    const updatedLesson = await updateLesson(id, updateData);

    return NextResponse.json({
      lesson: {
        lessonId: updatedLesson.$id,
        moduleId: (updatedLesson as any).moduleId,
        courseId: (updatedLesson as any).courseId,
        title: (updatedLesson as any).title,
        description: (updatedLesson as any).description,
        videoUrl: (updatedLesson as any).videoUrl,
        duration: (updatedLesson as any).duration,
        order: (updatedLesson as any).order,
        isFreePreview: (updatedLesson as any).isFreePreview,
        resources: typeof (updatedLesson as any).resources === 'string' 
          ? JSON.parse((updatedLesson as any).resources) 
          : (updatedLesson as any).resources || [],
        createdAt: updatedLesson.$createdAt,
      },
    });
  } catch (error: any) {
    console.error('Update lesson error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const lesson = await getLesson(id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Verify user owns the course
    const course = await getCourse((lesson as any).courseId);
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

    await deleteLesson(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete lesson error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
