import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [orders, tradeIns, productCount] = await Promise.all([
      prisma.order.findMany({ select: { totalAmount: true } }),
      prisma.tradeInRequest.count(),
      prisma.product.count(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      metrics: {
        totalRevenue,
        ordersCount: orders.length,
        tradeInsCount: tradeIns,
        productCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

