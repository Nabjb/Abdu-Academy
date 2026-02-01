import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { databases, DATABASE_ID } from '@/lib/appwrite/client';
import { COLLECTION_IDS } from '@/lib/appwrite/collection-ids';
import { Query } from 'node-appwrite';

// GET /api/admin/purchases - List all purchases (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = parseInt(searchParams.get('offset') || '0');

    const queries: string[] = [];

    if (status) {
      queries.push(Query.equal('status', status));
    }

    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    queries.push(Query.orderDesc('purchasedAt'));

    const purchases = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PURCHASES,
      queries
    );

    return NextResponse.json({
      success: true,
      purchases: purchases.documents.map((purchase: any) => ({
        purchaseId: purchase.$id,
        userId: purchase.userId,
        courseId: purchase.courseId,
        stripePaymentId: purchase.stripePaymentId,
        stripeSessionId: purchase.stripeSessionId,
        amount: purchase.amount,
        currency: purchase.currency,
        status: purchase.status,
        purchasedAt: purchase.purchasedAt,
      })),
      total: purchases.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Admin list purchases error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}
