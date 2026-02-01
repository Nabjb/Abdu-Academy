import { NextRequest, NextResponse } from 'next/server';
import { reorderModules, getCourse } from '@/lib/appwrite/helpers';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { z } from 'zod';

const reorderSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  moduleOrders: z.array(
    z.object({
      moduleId: z.string().min(1),
      order: z.number().int().min(0),
    })
  ).min(1, 'At least one module order is required'),
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

    const { courseId, moduleOrders } = validation.data;

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

    // Reorder modules
    const result = await reorderModules(courseId, moduleOrders);

    return NextResponse.json({
      modules: result.documents.map((doc: any) => ({
        moduleId: doc.$id,
        courseId: doc.courseId,
        title: doc.title,
        description: doc.description,
        order: doc.order,
        createdAt: doc.$createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Reorder modules error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reorder modules' },
      { status: 500 }
    );
  }
}
