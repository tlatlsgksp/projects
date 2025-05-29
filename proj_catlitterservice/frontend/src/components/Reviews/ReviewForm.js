import React, { useState } from "react";

// ✅ Context
import { useReview } from "../../context/ReviewContext";

// ✅ Components
import RatingStars from "./RatingStars";

const ReviewForm = ({
  productId,
  reviewId = null,
  initialRating = 0,
  initialContent = "",
  initialImages = [],
  onCancel,
  onSubmitted,
}) => {
  const { addReview, editReview } = useReview();
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [previewUrls, setPreviewUrls] = useState(initialImages);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !content.trim()) return;

    const imageUrls = previewUrls;

    if (reviewId) {
      await editReview(reviewId, { rating, content, imageUrls });
    } else {
      await addReview({ productId, rating, content, imageUrls });
    }

    onSubmitted?.();
    setRating(0);
    setContent("");
    setPreviewUrls([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-6">
      <RatingStars rating={rating} editable onChange={setRating} />
      <textarea
        className="w-full border rounded p-2 text-sm"
        placeholder="후기를 입력해주세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-2 overflow-x-auto">
        {previewUrls.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt="미리보기"
            className="w-20 h-20 object-cover rounded border"
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
          {reviewId ? "수정 완료" : "등록"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded text-sm"
            onClick={onCancel}
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;