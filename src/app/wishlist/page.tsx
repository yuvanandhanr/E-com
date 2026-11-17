'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  brand: { name: string };
  category: { name: string };
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
  }>;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const loadWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleAddToCart = (product: WishlistItem) => {
    const variant = product.variants[0];
    if (!variant) return;

    addItem({
      variantId: variant.id,
      productId: product.id,
      title: product.name,
      variantTitle: variant.title,
      price: variant.price,
      image: variant.images[0] || '/placeholder.png',
      quantity: 1,
    });

    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Saved Wishlist</h1>
          <p className="text-sm text-slate-400 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <Link
          href="/catalog"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          &larr; Continue Shopping
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 bg-slate-900 border border-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/80 rounded-full flex items-center justify-center text-2xl">
            ❤️
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Your wishlist is currently empty</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 mb-6">
            Explore our curated catalog of flagship laptops, smartphones, and genuine accessories. Click the heart icon on any product to save it here!
          </p>
          <Link
            href="/catalog"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all inline-block"
          >
            Browse Electronics Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const variant = product.variants[0];
            const isAdded = addedMap[product.id];
            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 group hover:shadow-xl hover:shadow-black/40"
              >
                <div className="relative aspect-square bg-slate-800/50 p-4 flex items-center justify-center overflow-hidden">
                  <Link href={`/catalog/${product.slug}`} className="w-full h-full flex items-center justify-center">
                    {variant?.images[0] ? (
                      <img
                        src={variant.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl">📱</span>
                    )}
                  </Link>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
                    title="Remove from wishlist"
                  >
                    <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
                      {product.brand.name} &bull; {product.category.name}
                    </div>
                    <Link
                      href={`/catalog/${product.slug}`}
                      className="text-sm font-semibold text-slate-100 hover:text-blue-400 line-clamp-2 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-emerald-400">
                        ₹{variant?.price.toLocaleString('en-IN')}
                      </span>
                      {variant?.compareAtPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ₹{variant.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      }`}
                    >
                      {isAdded ? '✓ Added' : 'Move to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

