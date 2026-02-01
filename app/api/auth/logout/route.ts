import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logoutUser } from '@/lib/appwrite/auth';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');

    if (sessionCookie) {
      // Delete session from Appwrite
      await logoutUser(sessionCookie.value);
    }

    // Create response and clear cookie
    const response = NextResponse.json({
      success: true,
    });

    response.cookies.delete('appwrite-session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if logout fails, clear the cookie
    const response = NextResponse.json({
      success: true,
    });
    
    response.cookies.delete('appwrite-session');
    
    return response;
  }
}
