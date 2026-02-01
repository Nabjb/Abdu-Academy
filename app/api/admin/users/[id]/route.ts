import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getUser, updateUser } from '@/lib/appwrite/helpers';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['student', 'instructor', 'admin']).optional(),
  avatar: z.string().url().optional(),
});

// GET /api/admin/users/[id] - Get user by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const user = await getUser(id) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: user.$id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.$createdAt,
        updatedAt: user.$updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const existingUser = await getUser(id) as any;
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await updateUser(id, validation.data) as any;

    return NextResponse.json({
      success: true,
      user: {
        userId: updatedUser.$id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        createdAt: updatedUser.$createdAt,
        updatedAt: updatedUser.$updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
