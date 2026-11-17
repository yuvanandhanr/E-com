'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  image: string | null;
  condition: string;
}

export function GlobalSearchModal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/catalog/${slug}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search iPhones, MacBooks, accessories..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700/80 rounded-full text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
        />
        <svg
          className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && (
          <div className="absolute right-3 top-2">
            <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-800/40 flex justify-between items-center">
            <span>Instant Results</span>
            <span>{results.length} found</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {results.length === 0 && !loading && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching electronics found for &quot;{query}&quot;
              </div>
            )}

            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelect(product.slug)}
                className="flex items-center gap-3 p-2.5 hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">📱</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{product.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="text-blue-400 font-semibold">{product.brand}</span>
                    <span>&bull;</span>
                    <span>{product.category}</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-emerald-400">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 text-center bg-slate-800/20">
            <Link
              href={`/catalog?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              See all results in catalog &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

