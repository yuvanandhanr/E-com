import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Package, RefreshCw, DollarSign, Shield, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [orders, tradeIns, totalProducts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { items: true },
    }),
    prisma.tradeInRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { inspection: true },
    }),
    prisma.product.count(),
  ]);

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Nexus Operations Command Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry for retail order fulfillment, warehouse intake, and buyback inspections.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/trade-ins"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Inspection Queue
          </Link>
          <Link
            href="/catalog"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            View Storefront
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales GMV</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">+18.4% this week</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders Processed</span>
            <Package className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{orders.length}</div>
          <span className="text-[10px] text-slate-400 block mt-1">Fulfilled via BlueDart & Delhivery</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trade-Ins Received</span>
            <RefreshCw className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{tradeIns.length}</div>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Reverse commerce active</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalog SKUs</span>
            <Shield className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalProducts} Models</div>
          <span className="text-[10px] text-slate-400 block mt-1">Mobiles, Chargers, Docks, Sleeves</span>
        </div>
      </div>

      {/* Two-column layout: Recent Orders & Trade-In Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
            <Link href="/orders" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <Link href={`/orders/${ord.orderNumber}`} className="font-mono font-bold text-indigo-600 hover:underline">
                    {ord.orderNumber}
                  </Link>
                  <span className="text-slate-400 block text-[10px]">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="text-center">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                  <Link href={`/orders/${ord.orderNumber}`} className="text-[10px] text-slate-400 hover:text-slate-700 block">
                    Inspect &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trade-Ins */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Trade-In Buyback Pipeline</h3>
            <Link href="/admin/trade-ins" className="text-xs font-bold text-emerald-600 hover:underline">
              Manage Queue &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {tradeIns.map((ti) => (
              <div key={ti.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-800">{ti.requestNumber}</span>
                  <span className="text-slate-500 font-semibold block">{ti.modelName}</span>
                </div>

                <div className="text-center">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {ti.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-600">
                    ₹{ti.initialQuotedPrice.toLocaleString('en-IN')}
                  </span>
                  <Link href={`/sell/track/${ti.requestNumber}`} className="text-[10px] text-indigo-600 hover:underline block">
                    Telemetry &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

