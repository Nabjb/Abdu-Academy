import { NextRequest, NextResponse } from 'next/server';
import { listCategories, createCategory } from '@/lib/appwrite/helpers';
import { requireAdmin } from '@/lib/auth/middleware';
import { z } from 'zod';
import { Category } from '@/types';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await listCategories();

    return NextResponse.json({
      success: true,
      categories: categories.documents.map((category: any) => ({
        categoryId: category.$id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        order: category.order,
      })),
    });
  } catch (error: any) {
    console.error('List categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, slug, description, icon, order } = validation.data;

    const newCategory = await createCategory({
      name,
      slug,
      description: description || '',
      icon,
      order,
    });

    const cat = newCategory as unknown as Category & { $id: string };
    return NextResponse.json({
      success: true,
      category: {
        categoryId: cat.$id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
      },
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
