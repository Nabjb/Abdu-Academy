import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/appwrite/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Login user
    const session = await loginUser(email, password);

    // Return session info
    // Note: For production, implement proper session handling
    // Appwrite's server SDK doesn't return session secrets
    // Frontend should use Appwrite's client SDK for auth
    return NextResponse.json({
      success: true,
      userId: session.userId,
      sessionId: session.$id,
      expires: session.expire,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle Appwrite errors
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
