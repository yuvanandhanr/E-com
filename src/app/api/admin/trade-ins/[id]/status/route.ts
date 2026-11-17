import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const start = Date.now();
  const route = '/api/admin/trade-ins/[id]/status';

  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSPECTION_AGENT')) {
      httpRequestCounter.inc({ method: 'PATCH', route, status: '403' });
      return NextResponse.json({ error: 'Inspection or Admin role required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, finalOfferedPrice, serialOrImei, notes } = body;

    const validStatuses = [
      'VALUATION_QUOTED',
      'PICKUP_SCHEDULED',
      'RECEIVED_AT_FACILITY',
      'INSPECTING',
      'OFFER_ACCEPTED',
      'COUNTER_OFFER_MADE',
      'REJECTED_RETURNED',
      'PAYOUT_PROCESSED',
    ];

    if (!validStatuses.includes(status)) {
      httpRequestCounter.inc({ method: 'PATCH', route, status: '400' });
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const tradeIn = await prisma.tradeInRequest.findUnique({ where: { id } });
    if (!tradeIn) {
      httpRequestCounter.inc({ method: 'PATCH', route, status: '404' });
      return NextResponse.json({ error: 'Trade-In Request not found' }, { status: 404 });
    }

    const updateData: any = { status };
    if (finalOfferedPrice !== undefined) {
      updateData.finalOfferedPrice = Number(finalOfferedPrice);
    }

    const updated = await prisma.tradeInRequest.update({
      where: { id },
      data: updateData,
      include: { inspection: true },
    });

    if (serialOrImei || notes) {
      await prisma.tradeInInspection.upsert({
        where: { tradeInRequestId: id },
        update: {
          serialOrImei: serialOrImei || undefined,
          notes: notes || undefined,
          inspectorId: user.id,
        },
        create: {
          tradeInRequestId: id,
          inspectorId: user.id,
          serialOrImei: serialOrImei || 'IMEI-PENDING',
          notes: notes || 'Inspection recorded by agent',
        },
      });
    }

    httpRequestCounter.inc({ method: 'PATCH', route, status: '200' });
    httpRequestDuration.observe({ method: 'PATCH', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({
      success: true,
      message: `Trade-in status updated to ${status}`,
      tradeIn: updated,
    });
  } catch (error) {
    httpRequestCounter.inc({ method: 'PATCH', route, status: '500' });
    return NextResponse.json({ error: 'Failed to update trade-in status' }, { status: 500 });
  }
}

