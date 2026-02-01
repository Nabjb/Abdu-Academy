import { cookies } from 'next/headers';
import { client } from '@/lib/appwrite/client';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication middleware utilities
 */

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'student' | 'instructor' | 'admin';
  } | null;
  isAuthenticated: boolean;
}

/**
 * Get authentication context from request
 */
export async function getAuthContext(): Promise<AuthContext> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');
    
    if (!sessionCookie) {
      return { user: null, isAuthenticated: false };
    }

    // Get user with session secret (server-side)
    const user = await getCurrentUser(sessionCookie.value);
    
    if (!user) {
      return { user: null, isAuthenticated: false };
    }

    return {
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        role: user.role || 'student',
      },
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Auth context error:', error);
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthContext['user']; error?: NextResponse }> {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { user: auth.user };
}

/**
 * Require role middleware
 */
export async function requireRole(
  request: NextRequest,
  roles: ('student' | 'instructor' | 'admin')[]
): Promise<{ user: AuthContext['user']; error?: NextResponse }> {
  const auth = await requireAuth(request);

  if (auth.error) {
    return auth;
  }

  if (!auth.user || !roles.includes(auth.user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Require admin middleware
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: AuthContext['user']; error?: NextResponse }> {
  return requireRole(request, ['admin']);
}

/**
 * Require instructor or admin middleware
 */
export async function requireInstructor(
  request: NextRequest
): Promise<{ user: AuthContext['user']; error?: NextResponse }> {
  return requireRole(request, ['instructor', 'admin']);
}
