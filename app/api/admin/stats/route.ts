import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { databases, DATABASE_ID } from '@/lib/appwrite/client';
import { COLLECTION_IDS } from '@/lib/appwrite/collection-ids';

// GET /api/admin/stats - Get platform-wide statistics
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    // Fetch all counts in parallel
    const [users, courses, purchases, categories] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS),
      databases.listDocuments(DATABASE_ID, COLLECTION_IDS.COURSES),
      databases.listDocuments(DATABASE_ID, COLLECTION_IDS.PURCHASES),
      databases.listDocuments(DATABASE_ID, COLLECTION_IDS.CATEGORIES),
    ]);

    // Calculate total revenue from completed purchases
    const completedPurchases = purchases.documents.filter(
      (p: any) => p.status === 'completed'
    );
    const totalRevenue = completedPurchases.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    );

    // Get published courses count
    const publishedCourses = courses.documents.filter(
      (c: any) => c.status === 'published'
    );

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPurchases = completedPurchases.filter(
      (p: any) => new Date(p.purchasedAt) >= thirtyDaysAgo
    );
    const recentRevenue = recentPurchases.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.total,
        totalCourses: courses.total,
        publishedCourses: publishedCourses.length,
        totalPurchases: purchases.total,
        completedPurchases: completedPurchases.length,
        totalRevenue: totalRevenue / 100, // Convert cents to dollars
        totalCategories: categories.total,
        recentPurchases: recentPurchases.length,
        recentRevenue: recentRevenue / 100,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
