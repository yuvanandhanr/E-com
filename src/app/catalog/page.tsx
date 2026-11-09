import React from 'react';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { ProductCondition } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface CatalogProps {
  searchParams: {
    category?: string;
    brand?: string;
    condition?: string;
    compat?: string;
    q?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogProps) {
  const { category, brand, condition, compat, q } = searchParams;

  // Build Prisma filter query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (category) {
    where.category = { slug: category };
  }

  if (brand) {
    where.brand = { slug: brand };
  }

  if (compat) {
    where.compatibility = { has: compat };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantWhere: any = {};
  if (condition) {
    variantWhere.condition = condition as ProductCondition;
  }

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: {
          where: variantWhere,
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
    prisma.brand.findMany(),
  ]);

  // Compatibility popular list
  const popularCompatibilities = [
    'MacBook Pro M1/M2/M3',
    'iPhone 15/16',
    'Dell XPS 13/15',
    'MagSafe Ecosystem',
    'USB-C DisplayPort 4K',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {category
              ? categories.find((c) => c.slug === category)?.name || 'Catalog'
              : 'Product Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} products • All items quality certified with 6-month warranty.
          </p>
        </div>

        {/* Search input for catalog */}
        <form action="/catalog" method="GET" className="relative w-full sm:w-72">
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="Search models, specs..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Filter className="h-3.5 w-3.5 text-indigo-600" />
                Filters
              </span>
              {(category || brand || condition || compat || q) && (
                <Link
                  href="/catalog"
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </Link>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Category</h4>
              <div className="space-y-1">
                <Link
                  href={`/catalog${brand ? `?brand=${brand}` : ''}`}
                  className={`block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    !category ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalog?category=${c.slug}${brand ? `&brand=${brand}` : ''}`}
                    className={`block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      category === c.slug
                        ? 'bg-indigo-50 font-bold text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Device Condition</h4>
              <div className="space-y-1">
                {[
                  { key: '', label: 'All Conditions' },
                  { key: 'BRAND_NEW', label: 'Brand New (Sealed)' },
                  { key: 'OPEN_BOX', label: 'Open Box (Like New)' },
                  { key: 'REFURBISHED_EXCELLENT', label: 'Refurbished (Grade A)' },
                  { key: 'REFURBISHED_GOOD', label: 'Refurbished (Grade B)' },
                ].map((cond) => (
                  <Link
                    key={cond.key}
                    href={`/catalog?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(brand ? { brand } : {}),
                      ...(cond.key ? { condition: cond.key } : {}),
                    }).toString()}`}
                    className={`block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      (condition || '') === cond.key
                        ? 'bg-indigo-50 font-bold text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cond.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Brand</h4>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/catalog?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      brand: b.slug,
                    }).toString()}`}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      brand === b.slug
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Device Compatibility Quick Filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Verified Compatibility</h4>
              <div className="space-y-1">
                {popularCompatibilities.map((cp) => (
                  <Link
                    key={cp}
                    href={`/catalog?compat=${encodeURIComponent(cp)}`}
                    className={`block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      compat === cp
                        ? 'bg-amber-50 font-bold text-amber-800'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ⚡ {cp}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn't find items matching your selected criteria. Try adjusting or clearing your filters.
              </p>
              <Link
                href="/catalog"
                className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

