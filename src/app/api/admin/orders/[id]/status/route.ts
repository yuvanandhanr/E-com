import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const start = Date.now();
  const route = '/api/admin/orders/[id]/status';

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      httpRequestCounter.inc({ method: 'PATCH', route, status: '403' });
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, note, trackingNumber, courierPartner } = body;

    const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      httpRequestCounter.inc({ method: 'PATCH', route, status: '400' });
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      httpRequestCounter.inc({ method: 'PATCH', route, status: '404' });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentTimeline = Array.isArray(order.timeline) ? (order.timeline as any[]) : [];
    const newEvent = {
      status,
      timestamp: new Date().toISOString(),
      title: `Order marked as ${status.replace(/_/g, ' ')}`,
      description: note || `Status updated by Admin (${user.firstName})`,
      trackingNumber: trackingNumber || order.trackingNumber,
      courierPartner: courierPartner || order.courierPartner,
    };

    currentTimeline.push(newEvent);

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingNumber: trackingNumber || order.trackingNumber,
        courierPartner: courierPartner || order.courierPartner,
        timeline: currentTimeline,
      },
    });

    httpRequestCounter.inc({ method: 'PATCH', route, status: '200' });
    httpRequestDuration.observe({ method: 'PATCH', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({
      success: true,
      message: `Order status advanced to ${status}`,
      order: updated,
    });
  } catch (error) {
    httpRequestCounter.inc({ method: 'PATCH', route, status: '500' });
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

