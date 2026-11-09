'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateTradeInValue, ConditionForm, SUPPORTED_DEVICES } from '@/lib/valuation-engine';
import { Smartphone, Laptop, Zap, CheckCircle2, ChevronRight, ArrowLeft, ShieldCheck, Banknote } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function TradeInWizard() {
  const router = useRouter();
  const { setTradeInCredit } = useCart();

  const [step, setStep] = useState<number>(1);
  const [deviceType, setDeviceType] = useState<'SMARTPHONE' | 'LAPTOP' | 'ACCESSORY'>('SMARTPHONE');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(SUPPORTED_DEVICES[0].id);

  const selectedDevice = SUPPORTED_DEVICES.find((d) => d.id === selectedDeviceId) || SUPPORTED_DEVICES[0];

  const [formData, setFormData] = useState<ConditionForm>({
    deviceId: selectedDeviceId,
    storage: selectedDevice.supportedStorages[0] || '128GB',
    screenCondition: 'FLAWLESS',
    bodyCondition: 'FLAWLESS',
    batteryHealth: 'GOOD',
    camerasFunctional: true,
    portsFunctional: true,
    hasOriginalBox: true,
    hasOriginalCharger: true,
  });

  const [pickupDetails, setPickupDetails] = useState({
    fullName: 'John Doe',
    phone: '+91 9812345678',
    streetLine1: '42 Cyber City, Tech Park Phase 2',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100',
    payoutMethod: 'UPI',
    upiId: 'john.doe@okhdfcbank',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle device change
  const handleDeviceChange = (devId: string) => {
    setSelectedDeviceId(devId);
    const dev = SUPPORTED_DEVICES.find((d) => d.id === devId);
    if (dev) {
      setFormData((prev) => ({
        ...prev,
        deviceId: devId,
        storage: dev.supportedStorages[0] || 'Standard',
      }));
    }
  };

  const valuation = calculateTradeInValue(formData);

  const filteredDevices = SUPPORTED_DEVICES.filter((d) => d.type === deviceType);

  const handleSubmitTradeIn = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        deviceType,
        brand: selectedDevice.brand,
        modelName: `${selectedDevice.name} (${formData.storage})`,
        declaredSpecs: {
          storage: formData.storage,
          battery: formData.batteryHealth,
        },
        conditionAnswers: {
          screen: formData.screenCondition,
          body: formData.bodyCondition,
          cameras: formData.camerasFunctional,
          ports: formData.portsFunctional,
          box: formData.hasOriginalBox,
          charger: formData.hasOriginalCharger,
        },
        initialQuotedPrice: valuation.finalQuote,
        pickupAddress: {
          fullName: pickupDetails.fullName,
          phone: pickupDetails.phone,
          streetLine1: pickupDetails.streetLine1,
          city: pickupDetails.city,
          state: pickupDetails.state,
          postalCode: pickupDetails.postalCode,
        },
        payoutMethod: pickupDetails.payoutMethod,
        payoutDetails: {
          upiId: pickupDetails.upiId,
        },
      };

      const res = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit trade-in');
      }

      // Also set trade-in credit into cart context in case user wants store discount
      setTradeInCredit(valuation.finalQuote);

      router.push(`/sell/track/${data.tradeIn.requestNumber}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* Wizard Header Progress */}
      <div className="bg-slate-900 px-6 py-5 text-white">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>STEP {step} OF 3</span>
          <span>{step === 1 ? 'Select Device' : step === 2 ? 'Condition Checklist' : 'Pickup & Instant Payout'}</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
          <div
            className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* STEP 1: Select Device */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Which device are you trading in?</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your category and model to unlock an instant algorithmic cash valuation.
              </p>
            </div>

            {/* Category tabs */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDeviceType('SMARTPHONE')}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                  deviceType === 'SMARTPHONE'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Smartphone className="h-6 w-6 mb-1.5" />
                <span className="text-xs font-bold">Mobiles</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('LAPTOP')}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                  deviceType === 'LAPTOP'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Laptop className="h-6 w-6 mb-1.5" />
                <span className="text-xs font-bold">Laptops</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('ACCESSORY')}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                  deviceType === 'ACCESSORY'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Zap className="h-6 w-6 mb-1.5" />
                <span className="text-xs font-bold">Accessories</span>
              </button>
            </div>

            {/* Device Model Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Model</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                {filteredDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.brand} {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Storage capacity selector */}
            {selectedDevice.supportedStorages.length > 1 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Internal Storage</label>
                <div className="flex gap-2">
                  {selectedDevice.supportedStorages.map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setFormData({ ...formData, storage: cap })}
                      className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                        formData.storage === cap
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Continue to Condition Check
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Condition Diagnostic Checklist */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Device Condition Diagnostic</h2>
                <p className="text-xs text-slate-500">Accurate answers guarantee instant approval without counter-offers.</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
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
                  { key: 'MINOR_SCRATCHES', label: 'Micro-scratches visible in light' },
                  { key: 'CRACKED', label: 'Cracked / Lines on LCD' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => setFormData({ ...formData, screenCondition: opt.key as any })}
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
                  { key: 'DENTED', label: 'Heavy dents or paint peel' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => setFormData({ ...formData, bodyCondition: opt.key as any })}
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
                    onClick={() => setFormData({ ...formData, batteryHealth: opt.key as any })}
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

            {/* Accessories checkboxes */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Accessories Included for Bonus Cash:</span>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasOriginalBox}
                    onChange={(e) => setFormData({ ...formData, hasOriginalBox: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600"
                  />
                  <span>Original Box Included (+₹1,000)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasOriginalCharger}
                    onChange={(e) => setFormData({ ...formData, hasOriginalCharger: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600"
                  />
                  <span>Original Fast Charger Included (+₹1,200)</span>
                </label>
              </div>
            </div>

            {/* Dynamic Valuation Real-time Card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Instant Algorithmic Valuation</span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    ₹{valuation.finalQuote.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Locked in & guaranteed for 7 days upon scheduling.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Banknote className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Lock Quote & Schedule Pickup
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pickup Address & Instant Payout method */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pickup Address & Direct Payout</h2>
                <p className="text-xs text-slate-500">A verification agent will collect your device and inspect it.</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
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

            {/* Address inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={pickupDetails.fullName}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={pickupDetails.phone}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={pickupDetails.streetLine1}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, streetLine1: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={pickupDetails.city}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal PIN Code</label>
                <input
                  type="text"
                  value={pickupDetails.postalCode}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, postalCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Payout method */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Direct Payout Method:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPickupDetails({ ...pickupDetails, payoutMethod: 'UPI' })}
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
                  onClick={() => setPickupDetails({ ...pickupDetails, payoutMethod: 'STORE_CREDIT' })}
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
                    onChange={(e) => setPickupDetails({ ...pickupDetails, upiId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitTradeIn}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting Request...' : `Confirm & Book Pickup (₹${valuation.finalQuote.toLocaleString('en-IN')})`}
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

