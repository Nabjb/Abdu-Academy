import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/middleware';
import { getUser, updateUser } from '@/lib/appwrite/helpers';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();

    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const profile = await getUser(auth.user.id);

    return NextResponse.json({
      success: true,
      profile: {
        userId: profile.$id,
        name: (profile as any).name,
        avatar: (profile as any).avatar,
        role: (profile as any).role,
        email: auth.user.email,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

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
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, avatar } = validation.data;

    // Update user profile
    await updateUser(auth.user.id, {
      ...(name && { name }),
      ...(avatar && { avatar }),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
