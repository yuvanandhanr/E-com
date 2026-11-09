import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // If Admin, can see all; if Customer, only see own
    const where = user.role === 'ADMIN' ? {} : { userId: user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { items, shippingAddress, paymentMethod, discountAmount } = await request.json();

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Cart items and shipping address are required' }, { status: 400 });
    }

    // Calculate totals and verify items from DB
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 400 });
      }

      const itemTotal = variant.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: variant.price,
        totalPrice: itemTotal,
        variantSnapshot: {
          name: variant.product.name,
          variantTitle: variant.title,
          condition: variant.condition,
          sku: variant.sku,
          image: variant.images[0] || '',
        },
      });

      // Deduct stock
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const discount = discountAmount ? Number(discountAmount) : 0;
    const shippingFee = subtotal > 1000 ? 0 : 99;
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NX-${randomSuffix}`;

    const initialTimeline = [
      {
        status: 'CONFIRMED',
        title: 'Order Confirmed & Payment Verified',
        timestamp: new Date().toISOString(),
      },
      {
        status: 'PROCESSING',
        title: 'Allocating inventory & IMEI serial check at fulfilment hub',
        timestamp: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      },
    ];

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        status: OrderStatus.CONFIRMED,
        subtotal,
        discountAmount: discount,
        shippingFee,
        totalAmount,
        shippingAddress,
        trackingNumber: `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        courierPartner: 'BlueDart Express Air',
        paymentMethod: paymentMethod || 'CARD',
        paymentStatus: 'PAID',
        timeline: initialTimeline,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}

