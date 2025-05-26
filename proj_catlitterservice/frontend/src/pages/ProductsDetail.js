import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Components
import BottomBar from "../components/BottomBar";
import ImageWithFallback from "../components/ImageWithFallback";

// ✅ Context
import { useCart } from "../context/CartContext";
import { useProduct } from "../context/ProductContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [variants, setVariants] = useState([]);
  const [showImages, setShowImages] = useState(true);
  const [showReviews, setShowReviews] = useState(true);

  const { fetchProductById, fetchVariantsByProduct, productMap } = useProduct();
  const { addToCartWithValidation } = useCart();

  const product = productMap[id];

  useEffect(() => {
    if (!id) return;
    fetchProductById(id);
    window.scrollTo(0, 0);
  }, [id, fetchProductById]);

  useEffect(() => {
    if (!product) return;
    fetchVariantsByProduct(product.id).then(setVariants);
  }, [product, fetchVariantsByProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCartWithValidation(product);
  };

  const getVariantLabel = (variant) => {
    switch (variant.type) {
      case "SAND":
        return `${variant.grainsize || "?"}, ${variant.capacity || "?"}L`;
      case "BAG":
        return `${variant.capacity || "?"}L`;
      case "SCOOP":
      case "LITTERBOX":
      default:
        return variant.size || "옵션 없음";
    }
  };

  const getVariantSortValue = (v) => {
    const sizeOrder = { "대형": 0, "중형": 1, "소형": 2 };
    const grainOrder = { "가는입자": 0, "중간입자": 1, "굵은입자": 2 };

    if (v.type === "LITTERBOX" || v.type === "SCOOP") {
      return sizeOrder[v.size?.trim()] ?? 99;
    }
    if (v.type === "SAND") {
      return (grainOrder[v.grainsize] ?? 9) * 100 + (v.capacity ?? 0);
    }
    return v.capacity || v.size || 9999;
  };

  if (!product) return <div className="p-10 text-center text-gray-500">로딩 중이에요</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* 제품 요약 정보 */}
        <div className="flex flex-col md:flex-row gap-10 bg-white p-8 shadow rounded-2xl mb-10">
          <div className="w-full md:w-1/2">
            <ImageWithFallback
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-[28rem] object-contain rounded mb-4"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            {product.brand && (
              <h2 className="text-lg font-semibold text-green-600 mb-4">
                [{product.brand}]
              </h2>
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">📄 제품 설명</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>

            {variants.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">📦 다른 크기/용량</h2>
                <div className="grid grid-cols-3 gap-2">
                  {[product, ...variants]
                    .filter((v, i, arr) => arr.findIndex(o => o.id === v.id) === i)
                    .sort((a, b) => getVariantSortValue(a) - getVariantSortValue(b))
                    .map((variant) => {
                      const isCurrent = variant.id === product.id;
                      return (
                        <button
                          key={variant.id}
                          disabled={isCurrent}
                          onClick={() => !isCurrent && navigate(`/products/${variant.id}`)}
                          className={`px-4 py-1 text-sm border rounded-lg transition ${
                            isCurrent
                              ? "bg-green-200 text-green-800 border-green-400 font-bold cursor-not-allowed"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          {getVariantLabel(variant)}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">📌 제품 정보</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>🧩 <span className="font-medium">타입:</span> {product.type}</li>
                {product.size && <li>📏 <span className="font-medium">크기:</span> {product.size}</li>}
                {product.shape && <li>🔹 <span className="font-medium">형태:</span> {product.shape}</li>}
                {product.dimensions && <li>📐 <span className="font-medium">규격:</span> {product.dimensions}</li>}
                {product.capacity && <li>🪣 <span className="font-medium">용량:</span> {product.capacity}L</li>}
                {product.material && <li>🧪 <span className="font-medium">재질:</span> {product.material}</li>}
              </ul>
            </div>

            <div className="mt-auto bg-white rounded-xl border p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                💡 이 제품은 구독 시 원하는 구성으로 선택할 수 있어요.
              </p>
            </div>

            <button id="add-to-cart-button" onClick={handleAddToCart} className="hidden" />
          </div>
        </div>

        {/* 상세 이미지 */}
        <div className="bg-white border rounded-xl p-6 mb-16 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📸 상세 이미지</h2>
            <button onClick={() => setShowImages(!showImages)} className="text-sm text-blue-600 hover:underline">
              {showImages ? "🔼" : "🔽"}
            </button>
          </div>
          <AnimatePresence>
            {showImages && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4"
              >
                {product.imageUrls?.map((url, i) => (
                  <ImageWithFallback
                    key={i}
                    src={url}
                    alt={`상세 이미지 ${i + 1}`}
                    className="w-full object-contain rounded-lg border"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 후기 (추후 기능 연동) */}
        <div id="reviews" className="bg-white border rounded-xl p-6 mb-20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">💬 상품 후기</h2>
            <button onClick={() => setShowReviews(!showReviews)} className="text-sm text-blue-600 hover:underline">
              {showReviews ? "🔼" : "🔽"}
            </button>
          </div>
          <AnimatePresence>
            {showReviews && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="text-gray-500 text-sm">
                  (후기 기능은 추후 추가 예정입니다.)
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 바텀바 고정 */}
          <BottomBar showFavorite={true} showApply={true} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;