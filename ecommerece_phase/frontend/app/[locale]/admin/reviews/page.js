"use client";

import { useEffect, useState } from "react";
import { adminGetReviews, adminModerateReview } from "@/lib/api/admin";
import { formatDate } from "@/lib/format";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");

  const load = () => {
    setLoading(true);
    adminGetReviews({ status })
      .then((res) => setReviews(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const moderate = async (id, decision) => {
    await adminModerateReview(id, decision);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Review Moderation</h1>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input mb-4 max-w-xs">
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">Nothing here.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{review.Product?.nameEn}</p>
                  <p className="text-xs text-gray-500">
                    {review.User?.name} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <span aria-hidden="true" className="text-accent">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
              {status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => moderate(review.id, "approved")} className="btn-outline text-xs !text-success">
                    Approve
                  </button>
                  <button onClick={() => moderate(review.id, "rejected")} className="btn-outline text-xs !text-danger">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
