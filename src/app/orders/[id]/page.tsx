import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import OrderTimeline from '@/components/OrderTimeline';
import { ArrowLeft, MapPin, Receipt, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id },
      ],
    },
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
  });

  if (!order) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = (order.shippingAddress as any) || {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">Order #{order.orderNumber}</h1>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Confirmed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Receipt className="h-3.5 w-3.5 text-indigo-600" />
          Download Tax Invoice
        </button>
      </div>

      {/* Live Stepper Component */}
      <OrderTimeline
        status={order.status}
        trackingNumber={order.trackingNumber}
        courierPartner={order.courierPartner}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timeline={(order.timeline as any) || []}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ordered Items Breakdown */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Items in this Shipment
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => {
              const image =
                item.variant.images[0] ||
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';

              return (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <Image src={image} alt={item.variant.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-500">{item.variant.product.name}</span>
                    <h4 className="text-xs font-bold text-slate-900">{item.variant.title}</h4>
                    <span className="text-[11px] font-mono text-indigo-600">Qty: {item.quantity}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      (₹{item.unitPrice.toLocaleString('en-IN')} each)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address & Payment Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>Destination Address</span>
            </div>
            <p className="text-xs font-bold text-slate-800">{addr.fullName || 'Valued Customer'}</p>
            <p className="text-xs text-slate-500">{addr.streetLine1}</p>
            <p className="text-xs text-slate-500">
              {addr.city}, {addr.state} - {addr.postalCode}
            </p>
            <p className="text-xs text-slate-500 pt-1 font-mono">{addr.phone}</p>
          </div>

          {/* Payment & Invoice Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Payment Summary
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Trade-In Discount</span>
                  <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Express Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Paid</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Paid via {order.paymentMethod} • Refurb Warranty Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

