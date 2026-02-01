import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { databases, DATABASE_ID } from '@/lib/appwrite/client';
import { COLLECTION_IDS } from '@/lib/appwrite/collection-ids';
import { Query } from 'node-appwrite';

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = parseInt(searchParams.get('offset') || '0');

    const queries: string[] = [];

    if (role) {
      queries.push(Query.equal('role', role));
    }

    if (search) {
      queries.push(Query.search('name', search));
    }

    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    queries.push(Query.orderDesc('$createdAt'));

    const users = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      queries
    );

    return NextResponse.json({
      success: true,
      users: users.documents.map((user: any) => ({
        userId: user.$id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.$createdAt,
        updatedAt: user.$updatedAt,
      })),
      total: users.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('List users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
