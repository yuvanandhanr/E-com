'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateTradeInValue, ConditionForm, SUPPORTED_DEVICES } from '@/lib/valuation-engine';
import { useCart } from '@/lib/cart-context';
import StepDeviceSelect from './trade-in/StepDeviceSelect';
import StepConditionCheck from './trade-in/StepConditionCheck';
import StepPickupPayout, { PickupDetails } from './trade-in/StepPickupPayout';

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

  const [pickupDetails, setPickupDetails] = useState<PickupDetails>({
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

  const handleSubmitTradeIn = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        deviceType,
        brand: selectedDevice.brand,
        modelName: `${selectedDevice.name} (${formData.storage})`,
        declaredSpecs: { storage: formData.storage, battery: formData.batteryHealth },
        conditionAnswers: {
          screen: formData.screenCondition,
          body: formData.bodyCondition,
          cameras: formData.camerasFunctional,
          ports: formData.portsFunctional,
          box: formData.hasOriginalBox,
          charger: formData.hasOriginalCharger,
        },
        initialQuotedPrice: valuation.finalQuote,
        pickupAddress: pickupDetails,
        payoutMethod: pickupDetails.payoutMethod,
        payoutDetails: { upiId: pickupDetails.upiId },
      };

      const res = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit trade-in');

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
        {step === 1 && (
          <StepDeviceSelect
            deviceType={deviceType}
            setDeviceType={setDeviceType}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={handleDeviceChange}
            storage={formData.storage}
            onStorageChange={(st) => setFormData((prev) => ({ ...prev, storage: st }))}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepConditionCheck
            formData={formData}
            setFormData={setFormData}
            valuation={valuation}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepPickupPayout
            pickupDetails={pickupDetails}
            setPickupDetails={setPickupDetails}
            finalQuote={valuation.finalQuote}
            submitting={submitting}
            errorMsg={errorMsg}
            onBack={() => setStep(2)}
            onSubmit={handleSubmitTradeIn}
          />
        )}
      </div>
    </div>
  );
}
