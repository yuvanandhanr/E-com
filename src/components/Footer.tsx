import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RefreshCw, Award, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      {/* Trust Value Propositions */}
      <div className="border-b border-slate-800 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">32-Point Quality Certified</h4>
                <p className="text-xs text-slate-400">All refurbished gear backed by 6-month warranty.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Instant Buyback Payout</h4>
                <p className="text-xs text-slate-400">Doorstep pickup & direct UPI / Bank transfer.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Express Air Dispatch</h4>
                <p className="text-xs text-slate-400">Free delivery on orders over ₹1,000.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Guaranteed Compatibility</h4>
                <p className="text-xs text-slate-400">Verified for MacBook, Dell XPS & flagship phones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                N
              </div>
              <span className="text-lg font-bold text-white">NexusGadgets</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier circular marketplace for buying verified mobile phones and high-performance laptop accessories, and selling old devices with guaranteed instant payouts.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Shop Catalog</h5>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li><Link href="/catalog?category=smartphones" className="hover:text-white">Smartphones (New & Refurbished)</Link></li>
              <li><Link href="/catalog?category=chargers-power" className="hover:text-white">GaN Fast Chargers (65W - 140W)</Link></li>
              <li><Link href="/catalog?category=docks-hubs" className="hover:text-white">Thunderbolt & USB-C Docks</Link></li>
              <li><Link href="/catalog?category=keyboards-mice" className="hover:text-white">Wireless Mechanical Keyboards</Link></li>
              <li><Link href="/catalog?category=sleeves-protection" className="hover:text-white">Laptop Sleeves & Rugged Bags</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Sell & Trade-In</h5>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li><Link href="/sell" className="hover:text-white">Sell Old Phone</Link></li>
              <li><Link href="/sell" className="hover:text-white">Sell Laptop & MacBook</Link></li>
              <li><Link href="/sell" className="hover:text-white">Instant Valuation Calculator</Link></li>
              <li><Link href="/orders" className="hover:text-white">Track Order Status</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Contact & Support</h5>
            <ul className="mt-4 space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>Tech Park Phase 2, Bengaluru, 560100</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span>+91 1800-NEXUS-TECH (Mon - Sat)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span>support@nexusgadgets.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} NexusGadgets Inc. All rights reserved. Built with Next.js, PostgreSQL & Docker.
        </div>
      </div>
    </footer>
  );
}

