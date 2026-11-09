import React from 'react';
import TradeInWizard from '@/components/TradeInWizard';
import { ShieldCheck, Banknote, RefreshCw, Truck, Lock, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Sell Your Mobile & Laptop Accessories for Instant Cash | NexusGadgets',
  description: 'Instant algorithmic valuation, free doorstep courier pickup, and direct UPI bank payout within 2 hours.',
};

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Headline */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          <span>Instant Buyback & Reverse Commerce</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Sell Your Device for <span className="text-emerald-600">Guaranteed Cash.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Get an instant algorithmic valuation in 60 seconds. We arrange free doorstep pickup, run our 32-point inspection, and transfer money directly to your UPI or bank account.
        </p>
      </div>

      {/* The Interactive Wizard */}
      <TradeInWizard />

      {/* How it Works Step-by-Step */}
      <div className="pt-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Transparent 3-Step Process</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">How Nexus Buyback Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Instant Online Quote</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select your smartphone, laptop, or premium accessory and answer simple condition questions to get a 7-day locked valuation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Free Doorstep Pickup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our insured courier collects your securely packaged device from your home or office at zero shipping cost to you.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-lg">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Instant UPI / Bank Transfer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upon quick diagnostic verification, funds are released directly into your bank or UPI within 2 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Data Privacy Guarantees */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-10 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">NIST 800-88 Data Sanitization</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Every received device undergoes a military-grade permanent memory wipe before refurbishing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Guaranteed Lock-in Price</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Your quote is locked for 7 days. If you decline a counter-offer, we return your device for free.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Zero Hidden Deductions</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Clear diagnostic breakdown of all cosmetic and functional factors before payout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

