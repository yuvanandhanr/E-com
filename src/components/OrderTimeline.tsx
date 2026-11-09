'use client';

import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Home, Copy, ExternalLink } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
  trackingNumber?: string | null;
  courierPartner?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeline?: any[];
}

const STEPS = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing & IMEI Check', icon: Package },
  { key: 'SHIPPED', label: 'Dispatched', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Clock },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function OrderTimeline({
  status,
  trackingNumber,
  courierPartner,
  timeline = [],
}: OrderTimelineProps) {
  const [copied, setCopied] = React.useState(false);

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = getStepIndex(status);

  const handleCopyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Live Shipment Status</span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            {status === 'DELIVERED' ? 'Delivered & Handed to Customer' : 'In Transit to Your Delivery Address'}
          </h3>
        </div>

        {trackingNumber && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700">
            <span>{courierPartner || 'Courier'}:</span>
            <code className="font-mono font-bold text-indigo-700">{trackingNumber}</code>
            <button
              onClick={handleCopyTracking}
              className="ml-1 text-slate-400 hover:text-slate-700"
              title="Copy tracking code"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            {copied && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
          </div>
        )}
      </div>

      {/* Visual Stepper */}
      <div className="py-8">
        <div className="relative flex justify-between">
          {/* Background Track Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-100 -z-0" />

          {/* Active Highlight Line */}
          <div
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-indigo-600 transition-all duration-500 -z-0"
            style={{
              width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100))}%`,
            }}
          />

          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : isCurrent
                      ? 'border-indigo-600 bg-white text-indigo-600 ring-4 ring-indigo-50'
                      : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`mt-2 text-center text-[11px] font-semibold max-w-[80px] sm:max-w-none ${
                    isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Checkpoint Logs */}
      {timeline && timeline.length > 0 && (
        <div className="mt-4 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Milestone History</h4>
          <div className="space-y-4">
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-indigo-50 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-800">{event.title}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

