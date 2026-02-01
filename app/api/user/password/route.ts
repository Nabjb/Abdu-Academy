import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/middleware';
import { updatePassword } from '@/lib/appwrite/auth';
import { z } from 'zod';

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthContext();

    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = updatePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Update password
    await updatePassword(currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
