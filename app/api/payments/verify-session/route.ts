import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { databases, DATABASE_ID } from '@/lib/appwrite/client';
import { COLLECTION_IDS } from '@/lib/appwrite/collection-ids';

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
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id parameter is required' },
        { status: 400 }
      );
    }

    // Find purchase by session ID
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PURCHASES,
      [`stripeSessionId.equal("${sessionId}")`, `userId.equal("${user.$id}")`]
    );

    if (result.documents.length === 0) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    const purchase = result.documents[0] as any;

    return NextResponse.json({
      success: true,
      purchase: {
        purchaseId: purchase.$id,
        courseId: purchase.courseId,
        userId: purchase.userId,
        amount: purchase.amount,
        currency: purchase.currency,
        status: purchase.status,
        purchasedAt: purchase.purchasedAt,
      },
    });
  } catch (error: any) {
    console.error('Verify session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    );
  }
}
