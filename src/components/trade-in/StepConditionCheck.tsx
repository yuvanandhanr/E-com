'use client';

import React from 'react';
import { ArrowLeft, ChevronRight, Banknote } from 'lucide-react';
import { ConditionForm } from '@/lib/valuation-engine';

interface StepConditionCheckProps {
  formData: ConditionForm;
  setFormData: React.Dispatch<React.SetStateAction<ConditionForm>>;
  valuation: { finalQuote: number; breakdown: { item: string; amount: number }[] };
  onBack: () => void;
  onNext: () => void;
}

export default function StepConditionCheck({
  formData,
  setFormData,
  valuation,
  onBack,
  onNext,
}: StepConditionCheckProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Device Condition Diagnostic</h2>
          <p className="text-xs text-slate-500">Accurate answers guarantee instant approval without counter-offers.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      {/* Screen Condition */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">Display / Screen Glass</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key: 'FLAWLESS', label: 'Flawless (No scratches)' },
            { key: 'MINOR_SCRATCHES', label: 'Micro-scratches in light' },
            { key: 'CRACKED', label: 'Cracked / LCD lines' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setFormData((prev) => ({ ...prev, screenCondition: opt.key as any }))}
              className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                formData.screenCondition === opt.key
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body Condition */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">Body / Edges Condition</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key: 'FLAWLESS', label: 'Like New (Mint)' },
            { key: 'MINOR_SCUFFS', label: 'Minor corner scuffs' },
            { key: 'DENTED', label: 'Heavy dents / paint peel' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setFormData((prev) => ({ ...prev, bodyCondition: opt.key as any }))}
              className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                formData.bodyCondition === opt.key
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Battery Health */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">Battery Health Status</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key: 'GOOD', label: 'Above 85% (Healthy)' },
            { key: 'NORMAL', label: '80% - 85%' },
            { key: 'DEGRADED', label: 'Below 80% / Service warning' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setFormData((prev) => ({ ...prev, batteryHealth: opt.key as any }))}
              className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                formData.batteryHealth === opt.key
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessories Bonuses */}
      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Accessories Bonus:</span>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasOriginalBox}
              onChange={(e) => setFormData((prev) => ({ ...prev, hasOriginalBox: e.target.checked }))}
              className="h-4 w-4 rounded text-indigo-600"
            />
            <span>Original Box Included (+₹1,000)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasOriginalCharger}
              onChange={(e) => setFormData((prev) => ({ ...prev, hasOriginalCharger: e.target.checked }))}
              className="h-4 w-4 rounded text-indigo-600"
            />
            <span>Original Charger Included (+₹1,200)</span>
          </label>
        </div>
      </div>

      {/* Dynamic Valuation Display */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Instant Algorithmic Valuation</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              ₹{valuation.finalQuote.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">Locked in and guaranteed for 7 days upon scheduling.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Banknote className="h-6 w-6" />
          </div>
        </div>
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
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
        >
          Lock Quote & Schedule Pickup
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

