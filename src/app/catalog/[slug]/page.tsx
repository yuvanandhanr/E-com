import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      variants: {
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

