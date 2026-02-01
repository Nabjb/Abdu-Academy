import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getUserPurchases } from '@/lib/appwrite/helpers';
import { getCourse } from '@/lib/appwrite/helpers';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');

    // Get user purchases
    const purchasesResult = await getUserPurchases(user.$id);
    let purchases = purchasesResult.documents;

    // Filter by category if provided
    if (category) {
      // We'll need to fetch course details to filter by category
      const purchasesWithCourses = await Promise.all(
        purchases.map(async (purchase: any) => {
          try {
            const course = await getCourse(purchase.courseId);
            return { purchase, course };
          } catch {
            return null;
          }
        })
      );

      purchases = purchasesWithCourses
        .filter((item: any) => item && (item.course as any).category === category)
        .map((item: any) => item.purchase);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPurchases = purchases.slice(startIndex, endIndex);

    // Fetch course details for each purchase
    const purchasesWithDetails = await Promise.all(
      paginatedPurchases.map(async (purchase: any) => {
        try {
          const course = await getCourse(purchase.courseId);
          return {
            purchaseId: purchase.$id,
            courseId: purchase.courseId,
            course: {
              courseId: (course as any).$id,
              title: (course as any).title,
              slug: (course as any).slug,
              thumbnail: (course as any).thumbnail,
              category: (course as any).category,
            },
            amount: purchase.amount,
            currency: purchase.currency,
            status: purchase.status,
            purchasedAt: purchase.purchasedAt,
            stripePaymentId: purchase.stripePaymentId,
          };
        } catch (error) {
          console.error('Error fetching course for purchase:', purchase.courseId);
          return {
            purchaseId: purchase.$id,
            courseId: purchase.courseId,
            course: null,
            amount: purchase.amount,
            currency: purchase.currency,
            status: purchase.status,
            purchasedAt: purchase.purchasedAt,
            stripePaymentId: purchase.stripePaymentId,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      purchases: purchasesWithDetails,
      pagination: {
        page,
        limit,
        total: purchases.length,
        totalPages: Math.ceil(purchases.length / limit),
      },
    });
  } catch (error: any) {
    console.error('Purchase history error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchase history' },
      { status: 500 }
    );
  }
}
