import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useProduct } from "../../context/ProductContext";

// ✅ Components
import ImageWithFallback from "../components/ImageWithFallback";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { fetchProductById, recommended } = useProduct();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      const result = await fetchProductById(id);
      if (result) setProduct(result);
    };
    loadProduct();
  }, [id, fetchProductById]);

  if (!product)
    return <div className="p-10 text-center text-gray-500">로딩 중이에요</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* ✅ 제품 상세 이미지 및 설명 */}
        <div className="flex flex-col md:flex-row items-start gap-10 bg-white shadow rounded-2xl p-8 mb-16">
          <div className="w-full md:w-1/2">
            <ImageWithFallback
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-[28rem] object-contain rounded mb-4"
            />
            <div className="flex gap-2 overflow-x-auto">
              {product.imageUrls?.map((url, i) => (
                <ImageWithFallback
                  key={i}
                  src={url}
                  alt={`추가 이미지 ${i + 1}`}
                  className="w-20 h-20 object-contain border rounded"
                />
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {product.name}
            </h1>
            {product.summary && (
              <p className="text-green-700 font-medium text-sm mb-4">
                {product.summary}
              </p>
            )}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                📄 제품 설명
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ 연관 제품 */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-green-500">🧩</span> 연관 제품
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended
              .filter((p) => p.id !== product.id && p.type === product.type)
              .slice(0, 6)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition"
                >
                  <Link to={`/products/${p.id}`} className="block">
                    <ImageWithFallback
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-40 object-contain mb-2 rounded"
                    />
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {p.summary}
                    </p>
                  </Link>
                </div>
              ))}
          </div>
        </div>

        {/* ✅ 리뷰 시스템: 추후 구현 예정 */}
        <div id="reviews" className="max-w-4xl mx-auto border-t pt-10 mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">💬 상품 후기</h2>
            <div className="space-x-2 text-sm text-gray-600">
              <button className="hover:text-blue-600">최신순</button>
              <button className="hover:text-blue-600">별점 높은순</button>
              <button className="hover:text-blue-600">별점 낮은순</button>
            </div>
          </div>
          <div className="text-gray-500 text-sm mb-4">
            (아직 후기가 없습니다. 추후 리뷰 시스템이 추가될 예정입니다.)
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;