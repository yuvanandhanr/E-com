import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, Banknote, Smartphone, AlertCircle } from 'lucide-react';
import ConditionBadge from '@/components/ConditionBadge';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function TradeInTrackPage({ params }: Props) {
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
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = (tradeIn.pickupAddress as any) || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payout = (tradeIn.payoutDetails as any) || {};

  const getStatusStage = (st: string) => {
    switch (st) {
      case 'VALUATION_QUOTED':
        return 1;
      case 'PICKUP_SCHEDULED':
        return 2;
      case 'RECEIVED_AT_FACILITY':
        return 3;
      case 'INSPECTING':
        return 4;
      case 'OFFER_ACCEPTED':
      case 'PAYOUT_PROCESSED':
        return 5;
      default:
        return 2;
    }
  };

  const currentStage = getStatusStage(tradeIn.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          href="/sell"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sell Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">Trade-In #{tradeIn.requestNumber}</h1>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                {tradeIn.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Device: <strong className="text-slate-800">{tradeIn.brand} {tradeIn.modelName}</strong>
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 px-5 py-3 text-white text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Locked Payout Value</span>
            <span className="text-xl font-extrabold text-emerald-400">
              ₹{(tradeIn.finalOfferedPrice || tradeIn.initialQuotedPrice).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Status Progress */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
          Lifecycle Tracking
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {[
            { num: 1, title: 'Quote Generated', desc: 'Price locked' },
            { num: 2, title: 'Pickup Booked', desc: 'Courier dispatch' },
            { num: 3, title: 'At Warehouse', desc: 'Sanitization & intake' },
            { num: 4, title: 'Diagnostic Check', desc: '32-point inspection' },
            { num: 5, title: 'Payout Transferred', desc: 'Direct UPI deposit' },
          ].map((st) => {
            const isCompleted = st.num < currentStage;
            const isCurrent = st.num === currentStage;

            return (
              <div
                key={st.num}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-slate-100 opacity-50'
                }`}
              >
                <div
                  className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCompleted || isCurrent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : st.num}
                </div>
                <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warehouse Diagnostic & Inspection Report */}
      {tradeIn.inspection ? (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Certified Inspection Results</h3>
            </div>
            <ConditionBadge condition={tradeIn.inspection.assignedGrade} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl bg-white p-3 border border-indigo-100">
              <span className="text-slate-400 block text-[10px] font-bold">VERIFIED IMEI</span>
              <span className="font-mono font-bold text-slate-800">
                {tradeIn.inspection.serialOrImei || 'Verified'}
              </span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-indigo-100">
              <span className="text-slate-400 block text-[10px] font-bold">BATTERY HEALTH</span>
              <span className="font-bold text-emerald-600">
                {tradeIn.inspection.batteryHealth ? `${tradeIn.inspection.batteryHealth}% Tested` : 'Passed'}
              </span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-indigo-100">
              <span className="text-slate-400 block text-[10px] font-bold">DISPLAY PANEL</span>
              <span className="font-bold text-slate-800">
                {tradeIn.inspection.screenPassed ? 'Flawless (Passed)' : 'Defective'}
              </span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-indigo-100">
              <span className="text-slate-400 block text-[10px] font-bold">CHASSIS / BODY</span>
              <span className="font-bold text-slate-800">
                {tradeIn.inspection.bodyPassed ? 'Certified Grade A' : 'Scuffed'}
              </span>
            </div>
          </div>

          {tradeIn.inspection.notes && (
            <div className="rounded-xl bg-white p-3.5 border border-indigo-100 text-xs text-slate-600">
              <strong className="text-slate-800">Technician Remarks:</strong> {tradeIn.inspection.notes}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 flex items-center gap-3">
          <Clock className="h-5 w-5 text-indigo-500 shrink-0" />
          <span>
            Diagnostic testing scheduled upon device arrival at our Bengaluru central testing hub.
          </span>
        </div>
      )}

      {/* Pickup & Payout Destination Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
            Doorstep Collection Details
          </h4>
          <p className="font-semibold text-slate-800">{addr.fullName}</p>
          <p className="text-slate-500">{addr.streetLine1}</p>
          <p className="text-slate-500">{addr.city}, {addr.state} - {addr.postalCode}</p>
          <p className="font-mono text-slate-500 pt-1">{addr.phone}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
            Payout Destination
          </h4>
          <div className="flex items-center gap-2 pt-1">
            <Banknote className="h-5 w-5 text-emerald-600" />
            <div>
              <span className="font-bold text-slate-800">{tradeIn.payoutMethod}</span>
              {payout.upiId && (
                <span className="block font-mono text-slate-500">{payout.upiId}</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            Payout is triggered automatically within 120 minutes of diagnostic approval.
          </p>
        </div>
      </div>
    </div>
  );
}

