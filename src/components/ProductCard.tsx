'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check, ShieldCheck, Zap } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import { useCart } from '@/lib/cart-context';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    compatibility?: string[];
    brand?: { name: string };
    category?: { name: string };
    variants: Array<{
      id: string;
      title: string;
      condition: string;
      price: number;
      compareAtPrice?: number | null;
      images: string[];
      stock: number;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = React.useState(false);

  const mainVariant = product.variants[0];
  if (!mainVariant) return null;

  const displayImage = mainVariant.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';
  const discountPercent = mainVariant.compareAtPrice
    ? Math.round(((mainVariant.compareAtPrice - mainVariant.price) / mainVariant.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      variantId: mainVariant.id,
      productId: product.id,
      name: product.name,
      title: mainVariant.title,
      price: mainVariant.price,
      compareAtPrice: mainVariant.compareAtPrice || undefined,
      condition: mainVariant.condition,
      image: displayImage,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Top Media Container */}
      <Link href={`/catalog/${product.slug}`} className="relative block h-56 w-full overflow-hidden bg-slate-50">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Condition Badge on Top-Left */}
        <div className="absolute left-3 top-3 z-10">
          <ConditionBadge condition={mainVariant.condition} />
        </div>

        {/* Discount Tag on Top-Right */}
        {discountPercent > 0 && (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
            Save {discountPercent}%
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{product.brand?.name || 'Electronics'}</span>
          <span>{product.category?.name}</span>
        </div>

        <Link href={`/catalog/${product.slug}`}>
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{mainVariant.title}</p>

        {/* Compatibility Pills */}
        {product.compatibility && product.compatibility.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.compatibility.slice(0, 2).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                <Zap className="h-2.5 w-2.5 text-amber-500" />
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Certified Warranty Indicator */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <ShieldCheck className="h-4 w-4" />
          <span>6-Month Warranty & Tested</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">
                ₹{mainVariant.price.toLocaleString('en-IN')}
              </span>
              {mainVariant.compareAtPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{mainVariant.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={mainVariant.stock <= 0}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

