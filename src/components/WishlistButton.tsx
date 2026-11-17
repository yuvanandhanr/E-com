'use client';

import React, { useState } from 'react';

interface WishlistButtonProps {
  productId: string;
  initialSaved?: boolean;
  className?: string;
  onToggle?: (saved: boolean) => void;
}

export function WishlistButton({
  productId,
  initialSaved = false,
  className = '',
  onToggle,
}: WishlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
        if (onToggle) onToggle(data.saved);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`p-2 rounded-full transition-all duration-200 ${
        saved
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
          : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-rose-400 hover:bg-slate-800'
      } ${className}`}
    >
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${saved ? 'scale-110 fill-current' : 'fill-none'}`}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

