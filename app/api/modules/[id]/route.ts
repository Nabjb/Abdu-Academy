import { NextRequest, NextResponse } from 'next/server';
import { getModule, updateModule, deleteModule, getCourse } from '@/lib/appwrite/helpers';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { z } from 'zod';

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const module = await getModule(id);
    
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      module: {
        moduleId: module.$id,
        courseId: (module as any).courseId,
        title: (module as any).title,
        description: (module as any).description,
        order: (module as any).order,
        createdAt: module.$createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch module' },
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

    const module = await getModule(id);
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

    const body = await request.json();
    const validation = updateModuleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedModule = await updateModule(id, validation.data);

    return NextResponse.json({
      module: {
        moduleId: updatedModule.$id,
        courseId: (updatedModule as any).courseId,
        title: (updatedModule as any).title,
        description: (updatedModule as any).description,
        order: (updatedModule as any).order,
        createdAt: updatedModule.$createdAt,
      },
    });
  } catch (error: any) {
    console.error('Update module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update module' },
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

    const module = await getModule(id);
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

    await deleteModule(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete module error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete module' },
      { status: 500 }
    );
  }
}
