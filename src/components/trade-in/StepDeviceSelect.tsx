'use client';

import React from 'react';
import { Smartphone, Laptop, Zap, ChevronRight } from 'lucide-react';
import { SUPPORTED_DEVICES } from '@/lib/valuation-engine';

interface StepDeviceSelectProps {
  deviceType: 'SMARTPHONE' | 'LAPTOP' | 'ACCESSORY';
  setDeviceType: (type: 'SMARTPHONE' | 'LAPTOP' | 'ACCESSORY') => void;
  selectedDeviceId: string;
  onDeviceChange: (devId: string) => void;
  storage: string;
  onStorageChange: (storage: string) => void;
  onNext: () => void;
}

export default function StepDeviceSelect({
  deviceType,
  setDeviceType,
  selectedDeviceId,
  onDeviceChange,
  storage,
  onStorageChange,
  onNext,
}: StepDeviceSelectProps) {
  const filteredDevices = SUPPORTED_DEVICES.filter((d) => d.type === deviceType);
  const selectedDevice = SUPPORTED_DEVICES.find((d) => d.id === selectedDeviceId) || SUPPORTED_DEVICES[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Which device are you trading in?</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select category and model for an instant algorithmic cash valuation.
        </p>
      </div>

      {/* Category selector */}
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
          onChange={(e) => onDeviceChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
        >
          {filteredDevices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.brand} {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Storage selector */}
      {selectedDevice.supportedStorages.length > 1 && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Storage Capacity</label>
          <div className="flex gap-2">
            {selectedDevice.supportedStorages.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => onStorageChange(cap)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  storage === cap
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
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Continue to Condition Check
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

