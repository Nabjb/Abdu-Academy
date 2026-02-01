import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/appwrite/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Register user (creates auth user + profile)
    const user = await registerUser(email, password, name);

    // Return success - client should login separately to get session
    return NextResponse.json({
      success: true,
      userId: user.userId,
      email: user.email,
      name: user.name,
      message: 'Registration successful. Please login to continue.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle Appwrite errors
    if (error.code === 409) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
