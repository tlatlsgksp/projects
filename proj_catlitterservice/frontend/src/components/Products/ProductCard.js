import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Components
import ImageWithFallback from "../Utils/ImageWithFallback";
import LikeButton from "../Utils/LikeButton";
import RatingStars from "../Reviews/RatingStars";

const ProductCard = ({
  product,
  liked = false,
  onToggleLike = () => {},
  showLike = true,
  compact = false,
  className = ""
}) => {
  return (
    <div
      className={`bg-white w-full rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all overflow-hidden flex flex-col ${className}`}
    >
      {/* 이미지 & 브랜드 */}
      <div className="relative bg-gray-50 p-4 pb-2">
        {product.brand && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-1 rounded shadow z-10">
            {product.brand}
          </span>
        )}
        <Link to={`/products/${product.id}`} className="block group">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className={`mx-auto ${compact ? "h-24" : "h-40"} object-contain transition-transform duration-300 group-hover:scale-105`}
          />
        </Link>
      </div>

      {/* 정보 */}
      <div className="flex-1 flex flex-col items-center text-center px-4 py-2 w-full">
        <Link to={`/products/${product.id}`} className="block w-full">
          <h3 className="text-base font-semibold text-gray-800 truncate w-full block">
            {product.name}
          </h3>
        </Link>

        {product.summary && (
          <p className="text-xs text-gray-500 mt-1 truncate w-full block">
            {product.summary}
          </p>
        )}
        
        {/* ⭐ 별점 표시 */}
        {product.averageRating !== undefined && (
          <div className="mt-1">
            <RatingStars rating={product.averageRating} />
          </div>
        )}
      </div>

      {/* 좋아요 */}
      {showLike && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <LikeButton
            productId={product.id}
            className="w-full justify-center py-1 border rounded-md shadow-sm bg-white hover:bg-gray-50"
          />
        </div>
      )}
    </div>
  );
};

export default ProductCard;