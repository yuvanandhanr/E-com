'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { CreditCard, Banknote, QrCode, Lock, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tradeInCredit, clearCart } = useCart();

  const [address, setAddress] = useState({
    fullName: 'John Doe',
    phone: '+91 9812345678',
    streetLine1: '42 Cyber City, Tech Park Phase 2',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100',
  });

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('UPI');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const shippingFee = subtotal > 1000 ? 0 : 99;
  const tradeInDiscount = Math.min(subtotal, tradeInCredit);
  const totalDiscount = tradeInDiscount + couponDiscount;
  const total = Math.max(0, subtotal - totalDiscount + shippingFee);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal, shippingFee }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponDiscount(data.discountAmount);
        setCouponMessage(data.message);
      } else {
        setCouponDiscount(0);
        setCouponMessage(data.message || 'Invalid coupon code');
      }
    } catch {
      setCouponMessage('Error applying promo code');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center p-6">
        <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-1">Please add items before proceeding to checkout.</p>
        <Link href="/catalog" className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white">
          Browse Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
        discountAmount: totalDiscount,
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      clearCart();
      router.push(`/orders/${data.order.orderNumber}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Checkout & Order Placement</h1>
        <p className="text-xs text-slate-500">Fast express dispatch with 6-month certified hardware warranty.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">1. Delivery Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                <input type="tel" required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input type="text" required value={address.streetLine1} onChange={(e) => setAddress({ ...address, streetLine1: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input type="text" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                <input type="text" required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">2. Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR (Instant)', icon: QrCode },
                { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id as any)} className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${paymentMethod === m.id ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Icon className="h-6 w-6 mb-1 text-indigo-600" />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Tag className="h-4 w-4 text-indigo-600" />
              <span>Promo Voucher</span>
            </div>
            <div className="flex gap-2">
              <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g. WELCOME10" className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:outline-none" />
              <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50">
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
            {couponMessage && (
              <p className={`text-[11px] font-medium ${couponDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {couponMessage}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Order Summary</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {items.map((i) => (
                <div key={i.variantId} className="py-2 flex justify-between">
                  <span className="font-semibold text-slate-800 line-clamp-1">{i.name} (x{i.quantity})</span>
                  <span className="font-bold text-slate-900">₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {tradeInDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Trade-In Value</span>
                  <span>-₹{tradeInDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-indigo-600 font-semibold">
                  <span>Promo Discount</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50">
              {loading ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')} & Confirm`}
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Lock className="h-3 w-3" />
              <span>Bank-level encrypted checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
