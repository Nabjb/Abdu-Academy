import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { databases, DATABASE_ID } from '@/lib/appwrite/client';
import { COLLECTION_IDS } from '@/lib/appwrite/collection-ids';
import { z } from 'zod';

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).optional(),
});

// GET /api/reviews/[id] - Get a specific review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.REVIEWS,
      id
    );

    return NextResponse.json({
      success: true,
      review: {
        reviewId: review.$id,
        userId: review.userId,
        courseId: review.courseId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.$createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get review error:', error);

    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update a review (author only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get existing review
    const existingReview = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.REVIEWS,
      id
    );

    // Check if user is the author
    if (existingReview.userId !== auth.user!.id) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    const updatedReview = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_IDS.REVIEWS,
      id,
      validation.data
    );

    return NextResponse.json({
      success: true,
      review: {
        reviewId: updatedReview.$id,
        userId: updatedReview.userId,
        courseId: updatedReview.courseId,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        createdAt: updatedReview.$createdAt,
      },
    });
  } catch (error: any) {
    console.error('Update review error:', error);

    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review (author or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    // Get existing review
    const existingReview = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.REVIEWS,
      id
    );

    // Check if user is the author or admin
    if (existingReview.userId !== auth.user!.id && auth.user!.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    await databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.REVIEWS, id);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete review error:', error);

    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
