import { NextRequest, NextResponse } from 'next/server';
import { getCategory, updateCategory, deleteCategory, getCategoryBySlug } from '@/lib/appwrite/helpers';
import { requireAdmin } from '@/lib/auth/middleware';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

// GET /api/categories/[id] - Get category by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if it's a slug (contains hyphens) or ID
    const isSlug = id.includes('-') || id.length > 24;

    let category: any;
    if (isSlug) {
      category = await getCategoryBySlug(id);
    } else {
      category = await getCategory(id);
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        categoryId: category.$id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        order: category.order,
      },
    });
  } catch (error: any) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category (admin only)
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
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const existingCategory = await getCategory(id) as any;
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updatedCategory = await updateCategory(id, validation.data) as any;

    return NextResponse.json({
      success: true,
      category: {
        categoryId: updatedCategory.$id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        icon: updatedCategory.icon,
        order: updatedCategory.order,
      },
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    const existingCategoryForDelete = await getCategory(id) as any;
    if (!existingCategoryForDelete) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    await deleteCategory(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
