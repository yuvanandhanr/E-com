import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

const DEFAULT_REVIEWS: Record<string, Review[]> = {
  default: [
    {
      id: 'rev-seed-1',
      productId: 'default',
      authorName: 'Arjun Sharma',
      rating: 5,
      title: 'Exceptional build quality & performance!',
      comment: 'Authentic product with pristine packaging. Delivery was super fast within 48 hours.',
      isVerifiedBuyer: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'rev-seed-2',
      productId: 'default',
      authorName: 'Priya Venkatesh',
      rating: 5,
      title: 'Best price compared to retail stores',
      comment: 'Extremely satisfied with the build and battery longevity. Seamless checkout with trade-in bonus.',
      isVerifiedBuyer: true,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'rev-seed-3',
      productId: 'default',
      authorName: 'Karthik Raman',
      rating: 4,
      title: 'Great accessory, worth the price',
      comment: 'Works out of the box with zero latency. Packaging could have been slightly sturdier.',
      isVerifiedBuyer: true,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
  ],
};

export async function GET(request: NextRequest) {
  const start = Date.now();
  const route = '/api/reviews';
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') || 'default';

  try {
    let reviews: Review[] = [];
    const cacheKey = `reviews:${productId}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      reviews = JSON.parse(cached);
    } else {
      reviews = DEFAULT_REVIEWS.default.map((r) => ({ ...r, productId }));
      await redis.set(cacheKey, JSON.stringify(reviews), 'EX', 86400);
    }

    const total = reviews.length;
    const avgRating = total > 0 ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)) : 5.0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      breakdown[star] = (breakdown[star] || 0) + 1;
    });

    httpRequestCounter.inc({ method: 'GET', route, status: '200' });
    httpRequestDuration.observe({ method: 'GET', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({ productId, avgRating, totalReviews: total, breakdown, reviews });
  } catch (error) {
    httpRequestCounter.inc({ method: 'GET', route, status: '500' });
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  const route = '/api/reviews';

  try {
    const body = await request.json();
    const { productId, authorName, rating, title, comment } = body;

    if (!productId || !authorName || !rating || !title || !comment) {
      httpRequestCounter.inc({ method: 'POST', route, status: '400' });
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating)));
    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId,
      authorName: String(authorName).trim(),
      rating: numRating,
      title: String(title).trim(),
      comment: String(comment).trim(),
      isVerifiedBuyer: true,
      createdAt: new Date().toISOString(),
    };

    const cacheKey = `reviews:${productId}`;
    let existing: Review[] = [];
    const cached = await redis.get(cacheKey);
    if (cached) {
      existing = JSON.parse(cached);
    } else {
      existing = DEFAULT_REVIEWS.default.map((r) => ({ ...r, productId }));
    }

    existing.unshift(newReview);
    await redis.set(cacheKey, JSON.stringify(existing), 'EX', 86400);

    httpRequestCounter.inc({ method: 'POST', route, status: '201' });
    httpRequestDuration.observe({ method: 'POST', route, status: '201' }, (Date.now() - start) / 1000);

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error: any) {
    console.error('Review submit error:', error);
    httpRequestCounter.inc({ method: 'POST', route, status: '500' });
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
