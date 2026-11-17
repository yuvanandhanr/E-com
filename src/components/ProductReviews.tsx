'use client';

import React, { useState, useEffect } from 'react';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
}

export function ProductReviews({ productId, productTitle }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
          setAvgRating(data.avgRating);
          setTotalReviews(data.totalReviews);
          setBreakdown(data.breakdown || {});
        }
      })
      .catch((err) => console.error('Failed to load reviews:', err));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !title || !comment) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, authorName, rating, title, comment }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews([data.review, ...reviews]);
        setTotalReviews((prev) => prev + 1);
        setShowForm(false);
        setTitle('');
        setComment('');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Customer Ratings & Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-400 text-sm">
              {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            </div>
            <span className="text-sm font-semibold text-slate-200">{avgRating} out of 5</span>
            <span className="text-xs text-slate-400">({totalReviews} verified reviews)</span>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-lg text-xs font-semibold transition-colors self-start md:self-auto"
        >
          {showForm ? 'Cancel Review' : '★ Write a Review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-900 border border-slate-700/80 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Reviewing: {productTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Vikram S."
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
              >
                <option value={5}>★★★★★ 5 - Excellent</option>
                <option value={4}>★★★★☆ 4 - Very Good</option>
                <option value={3}>★★★☆☆ 3 - Average</option>
                <option value={2}>★★☆☆☆ 2 - Below Average</option>
                <option value={1}>★☆☆☆☆ 1 - Poor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flawless condition and battery health"
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Detailed Review</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with battery, performance, accessories, and delivery..."
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold">
                  {r.authorName[0]}
                </div>
                <span className="text-xs font-semibold text-slate-200">{r.authorName}</span>
                {r.isVerifiedBuyer && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified Buyer
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-amber-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              <span className="text-xs font-medium text-slate-200">{r.title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

