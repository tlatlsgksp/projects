import React, { useEffect, useMemo, useState } from "react";

// ✅ Components
import RatingStars from "./RatingStars";
import ReviewForm from "./ReviewForm";
import ReviewItem from "./ReviewItem";

// ✅ Context
import { useAuth } from "../../context/AuthContext";
import { useReview } from "../../context/ReviewContext";

const ReviewSection = ({ productId, showForm = true, allowFilter = true, highlightMyReview = true, scrollRef }) => {
  const { reviews, fetchReviews, averageRating } = useReview();
  const { user } = useAuth();
  const [selectedStar, setSelectedStar] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    if (productId) fetchReviews(productId);
  }, [productId]);

  const filteredReviews = useMemo(() => {
    const base = reviews || [];
    const filtered = selectedStar ? base.filter(r => r.rating === selectedStar) : base;
    if (!highlightMyReview || !user) return filtered;

    const myReview = filtered.find(r => r.userId === user.id);
    const others = filtered.filter(r => r.userId !== user.id);
    return myReview ? [myReview, ...others] : filtered;
  }, [reviews, selectedStar, user]);

  return (
    <div ref={scrollRef} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
      {/* 리뷰 요약 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <RatingStars rating={averageRating} />
          <span className="text-gray-700 font-medium text-sm">
            {averageRating?.toFixed(1)} / 5.0
          </span>
          <span className="text-gray-500 text-sm">({reviews.length}건)</span>
        </div>
      </div>

      {/* 필터 버튼 */}
      {allowFilter && (
        <div className="flex gap-2 border-b border-gray-200 pb-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedStar(star === selectedStar ? null : star)}
              className={`px-3 py-1 text-sm rounded-full border transition-all
                ${selectedStar === star
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"}`}
            >
              ⭐ {star}점
            </button>
          ))}
        </div>
      )}

      {/* 리뷰 작성 or 수정 */}
      {showForm && (
        <div className="border border-blue-100 bg-blue-50 p-4 rounded-lg">
          {!editTarget ? (
            <ReviewForm productId={productId} onSubmitted={() => fetchReviews(productId)} />
          ) : (
            <ReviewForm
              productId={productId}
              reviewId={editTarget.id}
              initialRating={editTarget.rating}
              initialContent={editTarget.content}
              initialImages={editTarget.imageUrls}
              onCancel={() => setEditTarget(null)}
              onSubmitted={() => {
                setEditTarget(null);
                fetchReviews(productId);
              }}
            />
          )}
        </div>
      )}

      {/* 리뷰 목록 */}
      {filteredReviews.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">아직 작성된 리뷰가 없어요.</p>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewItem key={review.id} review={review} onEdit={setEditTarget} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;