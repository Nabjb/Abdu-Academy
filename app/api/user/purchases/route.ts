import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/middleware';
import { getUserPurchases } from '@/lib/appwrite/helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();

    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user purchases
    const purchases = await getUserPurchases(auth.user.id);

    return NextResponse.json({
      success: true,
      purchases: purchases.documents.map((purchase: any) => ({
        purchaseId: purchase.$id,
        courseId: purchase.courseId,
        amount: purchase.amount,
        currency: purchase.currency,
        status: purchase.status,
        purchasedAt: purchase.purchasedAt,
      })),
    });
  } catch (error: any) {
    console.error('Get purchases error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}
