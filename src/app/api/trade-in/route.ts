import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { TradeInStatus } from '@prisma/client';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const where = user.role === 'ADMIN' || user.role === 'INSPECTION_AGENT' ? {} : { userId: user.id };

    const tradeIns = await prisma.tradeInRequest.findMany({
      where,
      include: {
        inspection: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tradeIns });
  } catch (error) {
    console.error('Error fetching trade-ins:', error);
    return NextResponse.json({ error: 'Failed to fetch trade-in requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      deviceType,
      brand,
      modelName,
      declaredSpecs,
      conditionAnswers,
      initialQuotedPrice,
      pickupAddress,
      payoutMethod,
      payoutDetails,
    } = body;

    if (!modelName || !initialQuotedPrice || !pickupAddress) {
      return NextResponse.json({ error: 'Missing required trade-in details' }, { status: 400 });
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestNumber = `TI-${randomSuffix}`;

    const tradeIn = await prisma.tradeInRequest.create({
      data: {
        requestNumber,
        userId: user ? user.id : null,
        deviceType: deviceType || 'SMARTPHONE',
        brand: brand || 'Generic',
        modelName,
        declaredSpecs: declaredSpecs || {},
        conditionAnswers: conditionAnswers || {},
        initialQuotedPrice: Number(initialQuotedPrice),
        status: TradeInStatus.PICKUP_SCHEDULED,
        pickupAddress,
        payoutMethod: payoutMethod || 'UPI',
        payoutDetails: payoutDetails || {},
      },
    });

    return NextResponse.json({ success: true, tradeIn });
  } catch (error) {
    console.error('Error submitting trade-in:', error);
    return NextResponse.json({ error: 'Failed to submit trade-in request' }, { status: 500 });
  }
}

