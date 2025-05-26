import React from "react";
import ProductCard from "../components/ProductCard";

function FlowSlider({ products }) {
  // 슬라이드 무한 반복 위해 2배 복제
  const duplicated = [...products, ...products];

  return (
    <div className="overflow-hidden relative w-full py-4 group">
      <div className="whitespace-nowrap flex gap-2 w-max group-hover:[animation-play-state:paused] animate-slide">
        {duplicated.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="w-[200px]">
            <ProductCard product={product} showLike={false} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlowSlider;