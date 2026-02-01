import { NextRequest, NextResponse } from 'next/server';
import { createModule, getModulesByCourse } from '@/lib/appwrite/helpers';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getCourse } from '@/lib/appwrite/helpers';
import { z } from 'zod';

const createModuleSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId query parameter is required' },
        { status: 400 }
      );
    }

    const result = await getModulesByCourse(courseId);
    
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
    console.error('Get modules error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch modules' },
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
    const validation = createModuleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { courseId, title, description, order } = validation.data;

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

    // Get current max order if order not provided
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const existingModules = await getModulesByCourse(courseId);
      moduleOrder = existingModules.documents.length;
    }

    // Create module
    const module = await createModule({
      courseId,
      title,
      description: description || '',
      order: moduleOrder,
    });

    return NextResponse.json({
      module: {
        moduleId: module.$id,
        courseId: module.courseId,
        title: module.title,
        description: module.description,
        order: module.order,
        createdAt: module.$createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create module' },
      { status: 500 }
    );
  }
}
