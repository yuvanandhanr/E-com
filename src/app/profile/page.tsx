'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  addresses: UserAddress[];
  stats: {
    ordersPlaced: number;
    tradeInsSubmitted: number;
    wishlistItems: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [streetLine1, setStreetLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi');
  const [postalCode, setPostalCode] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setFirstName(data.profile.firstName || '');
        setLastName(data.profile.lastName || '');
        setPhone(data.profile.phone || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = { firstName, lastName, phone };
      if (showAddressForm && streetLine1 && city && postalCode) {
        payload.newAddress = { streetLine1, city, state, postalCode };
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
        setShowAddressForm(false);
        setStreetLine1('');
        setCity('');
        setPostalCode('');
        fetchProfile();
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-100">Please sign in to view your account</h2>
        <Link href="/login" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{profile.firstName} {profile.lastName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{profile.email} {profile.phone && `• ${profile.phone}`}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/orders" className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors">
            My Orders
          </Link>
          <Link href="/wishlist" className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors">
            Wishlist ({profile.stats.wishlistItems})
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Orders Placed</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{profile.stats.ordersPlaced}</div>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Active Trade-Ins</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{profile.stats.tradeInsSubmitted}</div>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Saved Items</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{profile.stats.wishlistItems}</div>
        </div>
      </div>

      {/* Edit Form & Address Book */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h2 className="text-base font-bold text-slate-100 mb-4">Account Information</h2>
          {message && (
            <div className="p-3 mb-4 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
              {message}
            </div>
          )}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
              />
            </div>

            {/* Add Address Collapsible */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                {showAddressForm ? '− Cancel adding address' : '+ Add new shipping address'}
              </button>

              {showAddressForm && (
                <div className="mt-3 p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-3">
                  <input
                    type="text"
                    value={streetLine1}
                    onChange={(e) => setStreetLine1(e.target.value)}
                    placeholder="Street Address / Flat No."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
                    />
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="PIN Code"
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Address Book Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h2 className="text-base font-bold text-slate-100 mb-4">Saved Shipping Addresses</h2>
          {profile.addresses.length === 0 ? (
            <p className="text-xs text-slate-400">No addresses saved yet. Use the form to add one.</p>
          ) : (
            <div className="space-y-3">
              {profile.addresses.map((addr) => (
                <div key={addr.id} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-200">{addr.fullName}</div>
                  <div className="text-slate-400">{addr.streetLine1}</div>
                  <div className="text-slate-400">{addr.city}, {addr.state} - {addr.postalCode}</div>
                  <div className="text-slate-500 text-[10px]">Phone: {addr.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

