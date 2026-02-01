import { NextRequest, NextResponse } from 'next/server';
import { listCourses, createCourse } from '@/lib/appwrite/helpers';
import { requireInstructor } from '@/lib/auth/middleware';
import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(10).max(200),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  thumbnail: z.string().url().optional(),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

// GET /api/courses - List courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search');

    const filters: string[] = [`status.equal("${status}")`];
    
    if (category) {
      filters.push(`category.equal("${category}")`);
    }
    
    if (level) {
      filters.push(`level.equal("${level}")`);
    }

    const courses = await listCourses(filters.length > 0 ? filters : undefined);

    // Filter by search if provided (client-side filtering for now)
    let filteredCourses = courses.documents;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = filteredCourses.filter((course: any) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      courses: filteredCourses.map((course: any) => ({
        courseId: course.$id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        price: course.price,
        currency: course.currency,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        instructorId: course.instructorId,
        status: course.status,
        totalDuration: course.totalDuration,
        totalLessons: course.totalLessons,
        createdAt: course.$createdAt,
        updatedAt: course.$updatedAt,
        publishedAt: course.publishedAt,
      })),
      total: filteredCourses.length,
    });
  } catch (error: any) {
    console.error('List courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create course
export async function POST(request: NextRequest) {
  try {
    const auth = await requireInstructor(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();

    // Validate input
    const validation = createCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create course
    const course = await createCourse({
      title: data.title,
      slug,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      currency: data.currency,
      thumbnail: data.thumbnail,
      category: data.category,
      level: data.level,
      instructorId: auth.user!.id,
      status: data.status,
      totalDuration: 0,
      totalLessons: 0,
      publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({
      success: true,
      course: {
        courseId: course.$id,
        slug,
      },
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
