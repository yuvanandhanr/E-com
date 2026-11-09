'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, LogOut, Shield, ArrowRightLeft, Menu, X, Package } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'INSPECTION_AGENT';
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      {/* Top Notification Announcement Bar */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-medium text-slate-200 flex items-center justify-center gap-3">
        <span>🚀 <strong>Exchange Bonus:</strong> Get extra 10% cash value when trading in towards any Laptop Accessory!</span>
        <Link href="/sell" className="underline hover:text-white">Estimate Value &rarr;</Link>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-xl shadow-md">
              N
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-950">Nexus</span>
              <span className="text-xl font-light text-indigo-600">Gadgets</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link
              href="/catalog"
              className={`transition-colors hover:text-indigo-600 ${
                pathname === '/catalog' ? 'text-indigo-600' : ''
              }`}
            >
              All Products
            </Link>
            <Link
              href="/catalog?category=smartphones"
              className="transition-colors hover:text-indigo-600"
            >
              Mobiles
            </Link>
            <Link
              href="/catalog?category=chargers-power"
              className="transition-colors hover:text-indigo-600"
            >
              GaN Chargers
            </Link>
            <Link
              href="/catalog?category=docks-hubs"
              className="transition-colors hover:text-indigo-600"
            >
              Docks & Hubs
            </Link>
            <Link
              href="/orders"
              className={`transition-colors hover:text-indigo-600 ${
                pathname.startsWith('/orders') ? 'text-indigo-600' : ''
              }`}
            >
              Track Order
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden lg:flex relative w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search iPhone, 140W GaN, Dock..."
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        </form>

        {/* Right CTA / Actions */}
        <div className="flex items-center gap-3">
          {/* Sell / Trade-in Highlighted Button */}
          <Link
            href="/sell"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-600" />
            Sell Your Device
          </Link>

          {/* User Account / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900">{user.firstName}</span>
                <span className="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider">
                  {user.role}
                </span>
              </div>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                  title="Admin Dashboard"
                >
                  <Shield className="h-5 w-5" />
                </Link>
              )}

              <Link
                href="/orders"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                title="My Orders"
              >
                <Package className="h-5 w-5" />
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-block rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Shopping Cart Button */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-xl bg-indigo-50 p-2.5 text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative w-full mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium focus:outline-none"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          </form>

          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            Catalog (All Items)
          </Link>
          <Link
            href="/catalog?category=smartphones"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            Smartphones
          </Link>
          <Link
            href="/catalog?category=chargers-power"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            GaN Chargers & Accessories
          </Link>
          <Link
            href="/sell"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-emerald-600 hover:underline"
          >
            Sell Your Device (Trade-in)
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
          >
            Track Order
          </Link>
        </div>
      )}
    </header>
  );
}

