import React from 'react';

interface ConditionBadgeProps {
  condition: string;
  className?: string;
}

export default function ConditionBadge({ condition, className = '' }: ConditionBadgeProps) {
  switch (condition) {
    case 'BRAND_NEW':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Brand New Sealed
        </span>
      );
    case 'OPEN_BOX':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          Open Box (Like New)
        </span>
      );
    case 'REFURBISHED_EXCELLENT':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Certified Refurbished (Grade A)
        </span>
      );
    case 'REFURBISHED_GOOD':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Refurbished (Grade B)
        </span>
      );
    case 'REFURBISHED_FAIR':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-300 ${className}`}>
          Refurbished (Fair / Budget)
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 ${className}`}>
          {condition.replace(/_/g, ' ')}
        </span>
      );
  }
}

