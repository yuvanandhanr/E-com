'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, ShieldCheck, Zap, Truck, ArrowRightLeft, Sparkles } from 'lucide-react';
import ConditionBadge from '@/components/ConditionBadge';
import { useCart } from '@/lib/cart-context';

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    compatibility: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseSpecs: any;
    brand: { name: string };
    category: { name: string; slug: string };
    variants: Array<{
      id: string;
      sku: string;
      title: string;
      condition: string;
      price: number;
      compareAtPrice?: number | null;
      stock: number;
      images: string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attributes: any;
    }>;
  };
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const [selectedImage, setSelectedImage] = useState(
    currentVariant.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
  );

  const discountPercent = currentVariant.compareAtPrice
    ? Math.round(((currentVariant.compareAtPrice - currentVariant.price) / currentVariant.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      variantId: currentVariant.id,
      productId: product.id,
      name: product.name,
      title: currentVariant.title,
      price: currentVariant.price,
      compareAtPrice: currentVariant.compareAtPrice || undefined,
      condition: currentVariant.condition,
      image: currentVariant.images[0] || selectedImage,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-indigo-600">Catalog</Link>
        <span>/</span>
        <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-indigo-600">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative h-96 sm:h-[480px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 z-10">
              <ConditionBadge condition={currentVariant.condition} />
            </div>
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 z-10 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                Save {discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {currentVariant.images.length > 1 && (
            <div className="flex gap-3">
              {currentVariant.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img ? 'border-indigo-600 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Verified Compatibility Box */}
          {product.compatibility && product.compatibility.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Zap className="h-4 w-4 text-amber-600" />
                <span>Verified Device Compatibility</span>
              </div>
              <p className="text-xs text-amber-800">
                Guaranteed full hardware support & tested with:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {product.compatibility.map((c, i) => (
                  <span key={i} className="rounded-lg bg-white/90 border border-amber-300 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Buying Actions & Specifications */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">{product.brand.name}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{product.name}</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{product.description}</p>
          </div>

          {/* Variant Selector (e.g. Brand New vs Refurbished) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Choose Condition & Variant
            </label>
            <div className="space-y-2">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantIndex(idx);
                    if (v.images[0]) setSelectedImage(v.images[0]);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    selectedVariantIndex === idx
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{v.title}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <ConditionBadge condition={v.condition} />
                        <span className="text-[10px] text-slate-500 font-mono">SKU: {v.sku}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900">
                        ₹{v.price.toLocaleString('en-IN')}
                      </span>
                      {v.compareAtPrice && (
                        <span className="block text-xs text-slate-400 line-through">
                          ₹{v.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-xl">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Final Price (Incl. Taxes)</span>
                <div className="text-3xl font-extrabold text-white mt-0.5">
                  ₹{currentVariant.price.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Truck className="h-4 w-4" />
                <span>Free Express Shipping</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={currentVariant.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold shadow-md transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </>
                )}
              </button>

              <Link
                href="/cart"
                onClick={handleAddToCart}
                className="flex items-center justify-center rounded-xl bg-white px-5 py-3.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Buy Now
              </Link>
            </div>
          </div>

          {/* Exchange & Trade-in Banner */}
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Have an old device to exchange?</h4>
                <p className="text-[11px] text-emerald-700">Get up to ₹88,000 instant credit off this purchase.</p>
              </div>
            </div>
            <Link
              href="/sell"
              className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Check Value &rarr;
            </Link>
          </div>

          {/* Technical Specifications Table */}
          {product.baseSpecs && Object.keys(product.baseSpecs).length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Specifications</h3>
              <dl className="divide-y divide-slate-100 text-xs">
                {Object.entries(product.baseSpecs).map(([key, val]) => (
                  <div key={key} className="py-2 flex justify-between">
                    <dt className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd className="font-semibold text-slate-900 text-right">{String(val)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

