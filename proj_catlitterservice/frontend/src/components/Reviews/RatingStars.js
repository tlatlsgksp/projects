import React from "react";

// ✅ Context
import { useReview } from "../../context/ReviewContext";

const RatingStars = ({ rating, editable = false, onChange = () => {} }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1 items-center">
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => editable && onChange(star)}
          className={`text-xl cursor-pointer ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;