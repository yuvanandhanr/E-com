'use client';

import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface PickupDetails {
  fullName: string;
  phone: string;
  streetLine1: string;
  city: string;
  state: string;
  postalCode: string;
  payoutMethod: string;
  upiId: string;
}

interface StepPickupPayoutProps {
  pickupDetails: PickupDetails;
  setPickupDetails: React.Dispatch<React.SetStateAction<PickupDetails>>;
  finalQuote: number;
  submitting: boolean;
  errorMsg: string;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepPickupPayout({
  pickupDetails,
  setPickupDetails,
  finalQuote,
  submitting,
  errorMsg,
  onBack,
  onSubmit,
}: StepPickupPayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pickup Address & Direct Payout</h2>
          <p className="text-xs text-slate-500">A verification agent will collect your device and inspect it.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Address Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={pickupDetails.fullName}
            onChange={(e) => setPickupDetails((p) => ({ ...p, fullName: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
          <input
            type="text"
            value={pickupDetails.phone}
            onChange={(e) => setPickupDetails((p) => ({ ...p, phone: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
          <input
            type="text"
            value={pickupDetails.streetLine1}
            onChange={(e) => setPickupDetails((p) => ({ ...p, streetLine1: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
          <input
            type="text"
            value={pickupDetails.city}
            onChange={(e) => setPickupDetails((p) => ({ ...p, city: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
          <input
            type="text"
            value={pickupDetails.postalCode}
            onChange={(e) => setPickupDetails((p) => ({ ...p, postalCode: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Payout Method */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Direct Payout Method:</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPickupDetails((p) => ({ ...p, payoutMethod: 'UPI' }))}
            className={`rounded-xl border p-3 text-xs font-bold transition-all ${
              pickupDetails.payoutMethod === 'UPI'
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            Instant UPI (VPA)
          </button>
          <button
            type="button"
            onClick={() => setPickupDetails((p) => ({ ...p, payoutMethod: 'STORE_CREDIT' }))}
            className={`rounded-xl border p-3 text-xs font-bold transition-all ${
              pickupDetails.payoutMethod === 'STORE_CREDIT'
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            Store Credit (+10% Bonus)
          </button>
        </div>

        {pickupDetails.payoutMethod === 'UPI' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID (e.g. mobile@upi)</label>
            <input
              type="text"
              value={pickupDetails.upiId}
              onChange={(e) => setPickupDetails((p) => ({ ...p, upiId: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
        >
          {submitting ? 'Submitting Request...' : `Confirm & Book Pickup (₹${finalQuote.toLocaleString('en-IN')})`}
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </button>
      </div>
    </div>
  );
}

