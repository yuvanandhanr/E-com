import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, ShieldCheck, Zap, RefreshCw, CheckCircle, Smartphone, Laptop, Sparkles, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getHomePageData() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
      take: 6,
    }),
    prisma.category.findMany(),
  ]);

  return { featuredProducts, categories };
}

export default async function HomePage() {
  const { featuredProducts, categories } = await getHomePageData();

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-16 pb-24">
        {/* Glow backdrop blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Next-Gen Circular Tech Store</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Buy Premium Tech. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  Sell Old Devices for Instant Cash.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Shop certified refurbished flagship mobiles, 140W GaN laptop chargers, and multi-display docks with a 6-month warranty. Or sell your used devices with algorithmic instant valuation & doorstep pickup.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/catalog"
                  className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
                >
                  Explore Catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/sell"
                  className="flex items-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-6 py-3.5 text-sm font-bold text-emerald-400 hover:bg-slate-750 transition-all hover:border-emerald-500/40"
                >
                  <RefreshCw className="h-4 w-4 text-emerald-400" />
                  Instant Sell Valuation
                </Link>
              </div>

              {/* Trust Micro-Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="block text-2xl font-black text-white">32-Point</span>
                  <span className="text-slate-400">Diagnostic Testing</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white">₹4.2 Cr+</span>
                  <span className="text-slate-400">Instant Buyback Paid</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white">6 Months</span>
                  <span className="text-slate-400">Standard Warranty</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Quick Valuation Box */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Quick Sell Estimate</h3>
                      <p className="text-[11px] text-slate-400">Find what your old device is worth today</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    Live Rates
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Device Brand</label>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="rounded-xl border border-indigo-500 bg-indigo-500/20 p-2.5 text-center text-xs font-bold text-indigo-300">
                        Apple
                      </span>
                      <span className="rounded-xl border border-slate-800 bg-slate-800/50 p-2.5 text-center text-xs font-bold text-slate-400">
                        Samsung
                      </span>
                      <span className="rounded-xl border border-slate-800 bg-slate-800/50 p-2.5 text-center text-xs font-bold text-slate-400">
                        Google
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Example: iPhone 13 (128GB)</span>
                      <span className="font-bold text-emerald-400">Up to ₹36,000</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Example: MacBook Pro M2 14"</span>
                      <span className="font-bold text-emerald-400">Up to ₹95,000</span>
                    </div>
                  </div>

                  <Link
                    href="/sell"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                  >
                    Start Full Condition Evaluation
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Curated Hardware</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Shop by Category</h2>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
            >
              <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-xl bg-slate-50">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-600">
                    <Laptop className="h-8 w-8" />
                  </div>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured & Certified Deals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Handpicked Quality</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Trending Devices & Accessories</h2>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All ({featuredProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. The Circular Tech Guarantee (Refurbishing Process) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12 text-white relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Circular Electronics Standard
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold">
                Every Refurbished Device Meets 32 Strict Diagnostic Checkpoints.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                We bridge the gap between quality and sustainability. Before any smartphone or accessory is listed on NexusGadgets, our hardware technicians run exhaustive battery health tests, component stress checks, port verifications, and ultrasonic cleaning.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Min 85% Battery Health</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>NIST 800-88 Data Sanitized</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Genuine OEM Parts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>6-Month Replacement Warranty</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 backdrop-blur space-y-4 max-w-sm w-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Quality Certificate</h4>
                    <p className="text-[11px] text-slate-400">Included with every purchase</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 border-t border-slate-700 pt-3 leading-relaxed">
                  "Nexus certified gear looks and performs like new right out of the box, saving you up to 40% off retail MSRP."
                </p>

                <Link
                  href="/catalog"
                  className="block text-center rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                >
                  Shop Certified Refurbished
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

