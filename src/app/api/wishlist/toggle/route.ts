import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { redis } from '@/lib/redis';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

export async function POST(request: NextRequest) {
  const start = Date.now();
  const route = '/api/wishlist/toggle';

  try {
    const user = await getCurrentUser();
    if (!user) {
      httpRequestCounter.inc({ method: 'POST', route, status: '401' });
      return NextResponse.json({ error: 'Please sign in to save items to your wishlist' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      httpRequestCounter.inc({ method: 'POST', route, status: '400' });
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const key = `wishlist:${user.id}`;
    const isMember = await redis.sismember(key, productId);

    let saved = false;
    if (isMember) {
      await redis.srem(key, productId);
      saved = false;
    } else {
      await redis.sadd(key, productId);
      saved = true;
    }

    const totalCount = await redis.scard(key);

    httpRequestCounter.inc({ method: 'POST', route, status: '200' });
    httpRequestDuration.observe({ method: 'POST', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({
      success: true,
      productId,
      saved,
      totalCount,
      message: saved ? 'Added to your wishlist!' : 'Removed from your wishlist',
    });
  } catch (error) {
    httpRequestCounter.inc({ method: 'POST', route, status: '500' });
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

