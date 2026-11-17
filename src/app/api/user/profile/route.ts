import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

export async function GET() {
  const start = Date.now();
  const route = '/api/user/profile';

  try {
    const user = await getCurrentUser();
    if (!user) {
      httpRequestCounter.inc({ method: 'GET', route, status: '401' });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const [fullUser, orderCount, tradeInCount, wishlistCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        include: { addresses: { orderBy: { createdAt: 'desc' } } },
      }),
      prisma.order.count({ where: { userId: user.id } }),
      prisma.tradeInRequest.count({ where: { userId: user.id } }),
      redis.scard(`wishlist:${user.id}`).catch(() => 0),
    ]);

    httpRequestCounter.inc({ method: 'GET', route, status: '200' });
    httpRequestDuration.observe({ method: 'GET', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({
      profile: {
        id: fullUser?.id,
        email: fullUser?.email,
        firstName: fullUser?.firstName,
        lastName: fullUser?.lastName,
        phone: fullUser?.phone,
        role: fullUser?.role,
        addresses: fullUser?.addresses || [],
        stats: {
          ordersPlaced: orderCount,
          tradeInsSubmitted: tradeInCount,
          wishlistItems: wishlistCount || 0,
        },
      },
    });
  } catch (error) {
    httpRequestCounter.inc({ method: 'GET', route, status: '500' });
    return NextResponse.json({ error: 'Failed to retrieve user profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const start = Date.now();
  const route = '/api/user/profile';

  try {
    const user = await getCurrentUser();
    if (!user) {
      httpRequestCounter.inc({ method: 'PUT', route, status: '401' });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, newAddress } = body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phone) updateData.phone = phone.trim();

    if (newAddress && newAddress.streetLine1 && newAddress.city && newAddress.postalCode) {
      updateData.addresses = {
        create: {
          fullName: newAddress.fullName || `${user.firstName} ${user.lastName}`,
          phone: newAddress.phone || user.phone || '',
          streetLine1: newAddress.streetLine1,
          streetLine2: newAddress.streetLine2 || '',
          city: newAddress.city,
          state: newAddress.state || 'Delhi',
          postalCode: newAddress.postalCode,
          country: newAddress.country || 'India',
          isDefault: true,
        },
      };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { addresses: true },
    });

    httpRequestCounter.inc({ method: 'PUT', route, status: '200' });
    httpRequestDuration.observe({ method: 'PUT', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        addresses: updated.addresses,
      },
    });
  } catch (error) {
    httpRequestCounter.inc({ method: 'PUT', route, status: '500' });
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

