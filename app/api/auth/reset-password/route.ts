import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/appwrite/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Secret token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, secret, password } = validation.data;

    // Reset password
    await resetPassword(userId, secret, password);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
