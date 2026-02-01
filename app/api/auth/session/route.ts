import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getAuthContext } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();

    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { user: null, isAuthenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      user: auth.user,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 200 }
    );
  }
}
