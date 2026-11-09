'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Banknote } from 'lucide-react';
import ConditionBadge from '@/components/ConditionBadge';

interface TradeInItem {
  id: string;
  requestNumber: string;
  deviceType: string;
  brand: string;
  modelName: string;
  initialQuotedPrice: number;
  finalOfferedPrice?: number | null;
  status: string;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declaredSpecs: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditionAnswers: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inspection?: any;
}

export default function AdminTradeInsPage() {
  const [tradeIns, setTradeIns] = useState<TradeInItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TradeInItem | null>(null);

  // Form state for inspection
  const [serialOrImei, setSerialOrImei] = useState('');
  const [batteryHealth, setBatteryHealth] = useState(88);
  const [screenPassed, setScreenPassed] = useState(true);
  const [bodyPassed, setBodyPassed] = useState(true);
  const [assignedGrade, setAssignedGrade] = useState('REFURBISHED_EXCELLENT');
  const [notes, setNotes] = useState('Inspected and certified. Screen and sensors tested.');
  const [updating, setUpdating] = useState(false);

  const fetchTradeIns = () => {
    setLoading(true);
    fetch('/api/trade-in')
      .then((res) => res.json())
      .then((data) => {
        if (data.tradeIns) setTradeIns(data.tradeIns);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTradeIns();
  }, []);

  const handleOpenInspect = (item: TradeInItem) => {
    setSelectedItem(item);
    setSerialOrImei(item.inspection?.serialOrImei || `354892019${Math.floor(100000 + Math.random() * 900000)}`);
    setBatteryHealth(item.inspection?.batteryHealth || 88);
    setScreenPassed(item.inspection?.screenPassed ?? true);
    setBodyPassed(item.inspection?.bodyPassed ?? true);
    setAssignedGrade(item.inspection?.assignedGrade || 'REFURBISHED_EXCELLENT');
    setNotes(item.inspection?.notes || 'Clean unit, genuine OEM parts, battery meets standards.');
  };

  const handleSaveInspection = async (approvePayout = false) => {
    if (!selectedItem) return;
    setUpdating(true);

    try {
      const payload = {
        status: approvePayout ? 'PAYOUT_PROCESSED' : 'INSPECTING',
        finalOfferedPrice: selectedItem.initialQuotedPrice,
        inspectionData: {
          serialOrImei,
          batteryHealth,
          screenPassed,
          bodyPassed,
          assignedGrade,
          notes,
        },
      };

      const res = await fetch(`/api/trade-in/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update inspection');

      setSelectedItem(null);
      fetchTradeIns();
    } catch (err) {
      console.error(err);
      alert('Error updating inspection');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Operations Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Trade-In Diagnostic & Intake Queue</h1>
            <p className="text-xs text-slate-500 mt-1">
              Test incoming phones & accessories, verify IMEI, assign condition grades, and release customer payouts.
            </p>
          </div>
          <button
            onClick={fetchTradeIns}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh List
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table of items */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 pb-4 border-b border-slate-100">
            Intake Queue ({tradeIns.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading incoming shipments...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tradeIns.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-700">{item.requestNumber}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{item.brand} {item.modelName}</h4>
                    <span className="text-[11px] text-slate-400">
                      Booked on {new Date(item.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        ₹{item.initialQuotedPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Locked Quote</span>
                    </div>

                    <button
                      onClick={() => handleOpenInspect(item)}
                      className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      {item.inspection ? 'Edit Grading' : 'Run Diagnostics'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnostic Panel */}
        <div className="lg:col-span-4">
          {selectedItem ? (
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Technician Diagnostic</h3>
                </div>
                <span className="font-mono text-xs font-bold text-indigo-700">{selectedItem.requestNumber}</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">IMEI / Serial Number</label>
                  <input
                    type="text"
                    value={serialOrImei}
                    onChange={(e) => setSerialOrImei(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-mono text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Battery Health (%)</label>
                  <input
                    type="number"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(Number(e.target.value))}
                    min={50}
                    max={100}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={screenPassed}
                      onChange={(e) => setScreenPassed(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-800">Display Glass & Digitizer Passed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bodyPassed}
                      onChange={(e) => setBodyPassed(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-800">Chassis & Housing Passed</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Assigned Refurb Grade</label>
                  <select
                    value={assignedGrade}
                    onChange={(e) => setAssignedGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="REFURBISHED_EXCELLENT">Grade A (Refurbished Excellent)</option>
                    <option value="REFURBISHED_GOOD">Grade B (Refurbished Good)</option>
                    <option value="REFURBISHED_FAIR">Grade C (Refurbished Fair)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Technician Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleSaveInspection(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md disabled:opacity-50"
                  >
                    <Banknote className="h-4 w-4" />
                    Approve Diagnostic & Release Payout
                  </button>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleSaveInspection(false)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Save Draft Inspection
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
              Select an item from the queue to start diagnostics & verify hardware sensors.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

