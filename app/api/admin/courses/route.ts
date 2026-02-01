import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { databases, DATABASE_ID } from '@/lib/appwrite/client';
import { COLLECTION_IDS } from '@/lib/appwrite/collection-ids';
import { Query } from 'node-appwrite';

// GET /api/admin/courses - List all courses (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = parseInt(searchParams.get('offset') || '0');

    const queries: string[] = [];

    if (status) {
      queries.push(Query.equal('status', status));
    }

    if (search) {
      queries.push(Query.search('title', search));
    }

    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    queries.push(Query.orderDesc('$createdAt'));

    const courses = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.COURSES,
      queries
    );

    return NextResponse.json({
      success: true,
      courses: courses.documents.map((course: any) => ({
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
      total: courses.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Admin list courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
