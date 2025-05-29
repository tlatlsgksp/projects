import React from "react";

// ✅ Context
import { useAuth } from "../../context/AuthContext";
import { useReview } from "../../context/ReviewContext";

// ✅ Components
import RatingStars from "./RatingStars";
import ImageWithFallback from "../Utils/ImageWithFallback";

const ReviewItem = ({ review, onEdit }) => {
  const { user } = useAuth();
  const { removeReview, fetchReviews } = useReview();
  const isMine = user?.id === review.userId;

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠어요?")) {
      await removeReview(review.id);
      fetchReviews(review.productId);
    }
  };

  return (
    <div className="border rounded p-3 text-sm space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-800">{review.user.nickname}</span>
        <RatingStars rating={review.rating} />
      </div>
      <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
      {review.imageUrls?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {review.imageUrls.map((url, i) => (
            <ImageWithFallback
              key={i}
              src={url}
              alt={`리뷰 이미지 ${i + 1}`}
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>
      )}
      <div className="flex justify-end items-center text-xs text-gray-400 gap-2">
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        {isMine && (
          <>
            <button
              onClick={() => onEdit?.(review)}
              className="text-blue-600 hover:underline"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:underline"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;