import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductCondition } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    const condition = searchParams.get('condition') as ProductCondition | null;
    const query = searchParams.get('q');
    const compatibility = searchParams.get('compat');
    const featured = searchParams.get('featured') === 'true';

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (compatibility) {
      where.compatibility = { has: compatibility };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantWhere: any = {};
    if (condition) {
      variantWhere.condition = condition;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: {
          where: variantWhere,
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also fetch available filter options (categories, brands) for the sidebar
    const categories = await prisma.category.findMany();
    const brands = await prisma.brand.findMany();

    return NextResponse.json({
      products,
      filters: {
        categories,
        brands,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

