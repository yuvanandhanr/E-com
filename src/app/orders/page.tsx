import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Package, Truck, ArrowRight, Search, Clock, CheckCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const user = await getCurrentUser();

  // If logged in, fetch their orders, else show recent demo orders
  const orders = await prisma.order.findMany({
    where: user ? { userId: user.id } : {},
    include: {
      items: {
        include: {
          variant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Search Header */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Shipment Intelligence</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Track Your Order</h1>
          <p className="text-xs text-slate-400">
            Enter your Nexus Order Number (e.g. NX-89421) or Courier Airway Bill (AWB) to view live milestone telemetry.
          </p>

          <form action="/orders" method="GET" className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                name="lookup"
                placeholder="Enter NX-89421..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
            >
              Track Live
            </button>
          </form>
        </div>
      </div>

      {/* Orders List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {user ? `Orders for ${user.firstName}` : 'Recent Shipments'}
          </h2>
          <span className="text-xs text-slate-500">{orders.length} orders found</span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No recent orders yet</p>
            <Link href="/catalog" className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:underline">
              Start shopping &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900">{ord.orderNumber}</span>
                      <span className="block text-[11px] text-slate-400">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'SHIPPED' || ord.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>

                    <Link
                      href={`/orders/${ord.orderNumber}`}
                      className="flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                    >
                      Track Stepper <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Items Ordered:</span>
                    <ul className="mt-1 space-y-1">
                      {ord.items.map((it) => (
                        <li key={it.id} className="text-slate-800 font-semibold">
                          • {it.quantity}x {it.variant.title} (₹{it.totalPrice.toLocaleString('en-IN')})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-slate-500">Order Amount</span>
                    <div className="text-base font-extrabold text-slate-900">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </div>
                    {ord.trackingNumber && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        AWB: {ord.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

