import { NextRequest, NextResponse } from 'next/server';
import { getCourse, updateCourse, deleteCourse } from '@/lib/appwrite/helpers';
import { requireInstructor, requireAdmin } from '@/lib/auth/middleware';
import { z } from 'zod';

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().min(10).max(200).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  thumbnail: z.string().url().optional(),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  totalDuration: z.number().optional(),
  totalLessons: z.number().optional(),
});

// GET /api/courses/[id] - Get course by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if it's a slug (contains hyphens and no special Appwrite ID characters)
    // Appwrite IDs are typically 24 character hex strings
    const isSlug = id.includes('-') || id.length > 24;
    
    let course;
    if (isSlug) {
      // Try to get by slug
      const { getCourseBySlug } = await import('@/lib/appwrite/helpers');
      course = await getCourseBySlug(id);
    } else {
      // Get by ID
      course = await getCourse(id);
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course: {
        courseId: course.$id,
        title: (course as any).title,
        slug: (course as any).slug,
        description: (course as any).description,
        shortDescription: (course as any).shortDescription,
        price: (course as any).price,
        currency: (course as any).currency,
        thumbnail: (course as any).thumbnail,
        category: (course as any).category,
        level: (course as any).level,
        instructorId: (course as any).instructorId,
        status: (course as any).status,
        totalDuration: (course as any).totalDuration,
        totalLessons: (course as any).totalLessons,
        createdAt: course.$createdAt,
        updatedAt: course.$updatedAt,
        publishedAt: (course as any).publishedAt,
      },
    });
  } catch (error: any) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireInstructor(request);
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if user owns the course (unless admin)
    const course = await getCourse(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (auth.user!.role !== 'admin' && (course as any).instructorId !== auth.user!.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own courses' },
        { status: 403 }
      );
    }

    // Update slug if title changed
    let updateData: any = { ...data };
    if (data.title) {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      updateData.slug = slug;
    }

    // Set publishedAt if status changed to published
    if (data.status === 'published' && !(course as any).publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    await updateCourse(id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
    });
  } catch (error: any) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    await deleteCourse(id);

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
