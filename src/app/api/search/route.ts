import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

export async function GET(request: NextRequest) {
  const start = Date.now();
  const route = '/api/search';
  const { searchParams } = new URL(request.url);

  const query = (searchParams.get('q') || '').trim();
  const categorySlug = searchParams.get('category');
  const brandSlug = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = searchParams.get('sort') || 'relevance';
  const limit = Math.min(20, Number(searchParams.get('limit')) || 10);

  try {
    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.variants = {
        some: {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: {
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
      orderBy,
      take: limit,
    });

    if (sort === 'price_asc') {
      products.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sort === 'price_desc') {
      products.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    }

    httpRequestCounter.inc({ method: 'GET', route, status: '200' });
    httpRequestDuration.observe({ method: 'GET', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({
      query,
      count: products.length,
      results: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category.name,
        brand: p.brand.name,
        price: p.variants[0]?.price || 0,
        image: p.variants[0]?.images[0] || null,
        condition: p.variants[0]?.condition || 'BRAND_NEW',
      })),
    });
  } catch (error) {
    httpRequestCounter.inc({ method: 'GET', route, status: '500' });
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}

