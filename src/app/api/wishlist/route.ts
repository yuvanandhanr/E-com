import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { redis } from '@/lib/redis';
import prisma from '@/lib/prisma';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

export async function GET() {
  const start = Date.now();
  const route = '/api/wishlist';

  try {
    const user = await getCurrentUser();
    if (!user) {
      httpRequestCounter.inc({ method: 'GET', route, status: '401' });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const key = `wishlist:${user.id}`;
    const productIds = await redis.smembers(key);

    if (!productIds || productIds.length === 0) {
      httpRequestCounter.inc({ method: 'GET', route, status: '200' });
      return NextResponse.json({ items: [], count: 0 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        brand: true,
        variants: {
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
    });

    httpRequestCounter.inc({ method: 'GET', route, status: '200' });
    httpRequestDuration.observe({ method: 'GET', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({ items: products, count: products.length });
  } catch (error) {
    httpRequestCounter.inc({ method: 'GET', route, status: '500' });
    return NextResponse.json({ error: 'Failed to retrieve wishlist' }, { status: 500 });
  }
}

