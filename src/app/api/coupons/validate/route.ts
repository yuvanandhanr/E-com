import { NextRequest, NextResponse } from 'next/server';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

interface CouponDefinition {
  code: string;
  type: 'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING';
  value: number; // percentage (e.g. 10) or flat amount in INR
  minSpend: number;
  maxDiscount?: number;
  description: string;
}

const ACTIVE_COUPONS: Record<string, CouponDefinition> = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minSpend: 1000,
    maxDiscount: 5000,
    description: '10% Instant Discount on First Purchase (up to ₹5,000)',
  },
  NEXUS500: {
    code: 'NEXUS500',
    type: 'FLAT',
    value: 500,
    minSpend: 4000,
    description: 'Flat ₹500 Off on premium orders above ₹4,000',
  },
  ACCESSORY20: {
    code: 'ACCESSORY20',
    type: 'PERCENTAGE',
    value: 20,
    minSpend: 1500,
    maxDiscount: 2000,
    description: '20% Off on Mobile & Laptop Accessories (up to ₹2,000)',
  },
  PROMAX1500: {
    code: 'PROMAX1500',
    type: 'FLAT',
    value: 1500,
    minSpend: 25000,
    description: 'VIP Flat ₹1,500 Off on Flagship Electronics above ₹25,000',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'FREE_SHIPPING',
    value: 100,
    minSpend: 500,
    description: 'Complimentary Express Insured Shipping',
  },
};

export async function POST(request: NextRequest) {
  const start = Date.now();
  const route = '/api/coupons/validate';

  try {
    const body = await request.json();
    const { code, subtotal, shippingFee = 0 } = body;

    if (!code || typeof code !== 'string') {
      httpRequestCounter.inc({ method: 'POST', route, status: '400' });
      return NextResponse.json({ valid: false, message: 'Coupon code is required' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = ACTIVE_COUPONS[normalizedCode];

    if (!coupon) {
      httpRequestCounter.inc({ method: 'POST', route, status: '404' });
      return NextResponse.json({
        valid: false,
        message: `Promo code "${normalizedCode}" is invalid or expired. Try WELCOME10 or NEXUS500.`,
      }, { status: 404 });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minSpend) {
      httpRequestCounter.inc({ method: 'POST', route, status: '400' });
      return NextResponse.json({
        valid: false,
        message: `Code "${coupon.code}" requires a minimum spend of ₹${coupon.minSpend.toLocaleString('en-IN')}. Current subtotal: ₹${orderSubtotal.toLocaleString('en-IN')}`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (orderSubtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'FLAT') {
      discountAmount = Math.min(coupon.value, orderSubtotal);
    } else if (coupon.type === 'FREE_SHIPPING') {
      discountAmount = Number(shippingFee) || 0;
    }

    discountAmount = Math.round(discountAmount);

    httpRequestCounter.inc({ method: 'POST', route, status: '200' });
    httpRequestDuration.observe({ method: 'POST', route, status: '200' }, (Date.now() - start) / 1000);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      discountAmount,
      description: coupon.description,
      message: `Success! ${coupon.description} applied (-₹${discountAmount.toLocaleString('en-IN')})`,
    });
  } catch (error: any) {
    httpRequestCounter.inc({ method: 'POST', route, status: '500' });
    return NextResponse.json({ valid: false, message: 'Internal server error validating coupon' }, { status: 500 });
  }
}

