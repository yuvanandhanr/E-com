import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ProductCondition, TradeInStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const tradeIn = await prisma.tradeInRequest.findFirst({
      where: {
        OR: [
          { id },
          { requestNumber: id },
        ],
      },
      include: {
        inspection: true,
      },
    });

    if (!tradeIn) {
      return NextResponse.json({ error: 'Trade-in request not found' }, { status: 404 });
    }

    return NextResponse.json({ tradeIn });
  } catch (error) {
    console.error('Error fetching trade-in:', error);
    return NextResponse.json({ error: 'Failed to retrieve trade-in details' }, { status: 500 });
  }
}

// POST or PATCH for inspectors to submit diagnostic review
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSPECTION_AGENT')) {
      return NextResponse.json({ error: 'Unauthorized inspection action' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, finalOfferedPrice, inspectionData } = body;

    const tradeIn = await prisma.tradeInRequest.findFirst({
      where: { OR: [{ id }, { requestNumber: id }] },
    });

    if (!tradeIn) {
      return NextResponse.json({ error: 'Trade-in not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status) updateData.status = status as TradeInStatus;
    if (finalOfferedPrice !== undefined) updateData.finalOfferedPrice = Number(finalOfferedPrice);

    const updated = await prisma.tradeInRequest.update({
      where: { id: tradeIn.id },
      data: updateData,
    });

    if (inspectionData) {
      await prisma.tradeInInspection.upsert({
        where: { tradeInRequestId: tradeIn.id },
        create: {
          tradeInRequestId: tradeIn.id,
          inspectorId: user.id,
          serialOrImei: inspectionData.serialOrImei || null,
          screenPassed: inspectionData.screenPassed ?? true,
          bodyPassed: inspectionData.bodyPassed ?? true,
          batteryHealth: inspectionData.batteryHealth ? Number(inspectionData.batteryHealth) : null,
          assignedGrade: (inspectionData.assignedGrade as ProductCondition) || ProductCondition.REFURBISHED_EXCELLENT,
          notes: inspectionData.notes || '',
        },
        update: {
          inspectorId: user.id,
          serialOrImei: inspectionData.serialOrImei || null,
          screenPassed: inspectionData.screenPassed ?? true,
          bodyPassed: inspectionData.bodyPassed ?? true,
          batteryHealth: inspectionData.batteryHealth ? Number(inspectionData.batteryHealth) : null,
          assignedGrade: (inspectionData.assignedGrade as ProductCondition) || ProductCondition.REFURBISHED_EXCELLENT,
          notes: inspectionData.notes || '',
        },
      });
    }

    return NextResponse.json({ success: true, tradeIn: updated });
  } catch (error) {
    console.error('Inspection update error:', error);
    return NextResponse.json({ error: 'Failed to update inspection' }, { status: 500 });
  }
}

