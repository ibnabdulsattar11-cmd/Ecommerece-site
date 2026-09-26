"use client";

import { useEffect, useState } from "react";
import { getProductReviews, submitReview, voteReviewHelpful } from "@/lib/api/products";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/format";

export default function ProductReviews({ productId, initialBreakdown }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [reviews, setReviews] = useState([]);
  const [breakdown, setBreakdown] = useState(initialBreakdown || {});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProductReviews(productId, { limit: 10 });
      setReviews(res.data || []);
      setBreakdown(res.breakdown || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const totalReviews = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return (
    <section id="reviews" className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Customer Reviews</h2>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          {totalReviews > 0 ? (
            <div className="flex flex-col gap-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown[star] || 0;
                const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-gray-600">{star}</span>
                    <span aria-hidden="true" className="text-accent">★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No reviews yet — be the first to review this product.</p>
          )}

          {isAuthenticated ? (
            <button onClick={() => setShowForm((v) => !v)} className="btn-outline mt-4 w-full">
              Write a review
            </button>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Log in to leave a review.</p>
          )}

          {showForm && <ReviewForm productId={productId} onSubmitted={() => { setShowForm(false); load(); }} />}
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <p className="text-sm text-gray-500">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing here yet.</p>
          ) : (
            <ul className="flex flex-col gap-6">
              {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} productId={productId} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewItem({ review, productId }) {
  const [helpful, setHelpful] = useState(review.helpfulCount || 0);
  const [voted, setVoted] = useState(false);

  const vote = async () => {
    if (voted) return;
    setVoted(true);
    setHelpful((h) => h + 1);
    try {
      await voteReviewHelpful(productId, review.id, true);
    } catch {
      // best-effort
    }
  };

  return (
    <li className="border-b border-gray-100 pb-6">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-accent">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </span>
        {review.isVerifiedPurchase && (
          <span className="badge bg-success-light text-success">Verified purchase</span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
        <span>{review.User?.name || "Anonymous"}</span>
        <span>·</span>
        <span>{formatDate(review.createdAt)}</span>
        <button onClick={vote} className="ms-2 underline hover:text-gray-600">
          Helpful ({helpful})
        </button>
      </div>
    </li>
  );
}

function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitReview(productId, { rating, comment });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <div>
        <label className="label">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
              className={n <= rating ? "text-accent" : "text-gray-300"}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="comment">
          Your review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="input"
          placeholder="What did you think?"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
