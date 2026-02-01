import { NextRequest, NextResponse } from 'next/server';
import { createReview, getCourseReviews, hasUserPurchasedCourse } from '@/lib/appwrite/helpers';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

const createReviewSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});

// GET /api/reviews - Get reviews for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required' },
        { status: 400 }
      );
    }

    const reviews = await getCourseReviews(courseId);

    // Calculate average rating
    const totalRating = reviews.documents.reduce(
      (sum: number, review: any) => sum + review.rating,
      0
    );
    const averageRating =
      reviews.documents.length > 0
        ? totalRating / reviews.documents.length
        : 0;

    return NextResponse.json({
      success: true,
      reviews: reviews.documents.map((review: any) => ({
        reviewId: review.$id,
        userId: review.userId,
        courseId: review.courseId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.$createdAt,
      })),
      total: reviews.total,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { courseId, rating, comment } = validation.data;
    const userId = auth.user!.id;

    // Check if user has purchased the course
    const hasPurchased = await hasUserPurchasedCourse(userId, courseId);
    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'You must purchase this course before leaving a review' },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this course
    const existingReviews = await getCourseReviews(courseId);
    const userReview = existingReviews.documents.find(
      (r: any) => r.userId === userId
    );
    if (userReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this course' },
        { status: 400 }
      );
    }

    const newReview = await createReview({
      userId,
      courseId,
      rating,
      comment,
    });

    return NextResponse.json({
      success: true,
      review: {
        reviewId: newReview.$id,
        userId: newReview.userId,
        courseId: newReview.courseId,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.$createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
