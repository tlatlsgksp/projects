import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useAuth } from "../context/AuthContext";
import { useProduct } from "../context/ProductContext";
import { useFavorite } from "../context/FavoriteContext";

// ✅ Components
import ProductCard from "../components/ProductCard";
import ProductFilterBar from "../components/ProductFilterBar";
import Pagination from "../components/Pagination";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    fetchProducts,
    products,
    totalCount,
    loading
  } = useProduct();
  const { favorites, fetchFavorites, toggleFavorite } = useFavorite();

  const limit = 10;
  const page = parseInt(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / limit);

  // ✅ URL → 필터 상태 반영
  const filters = {
    type: searchParams.get("type") || "",
    size: searchParams.get("size") || "",
    material: searchParams.get("material") || "",
    sort: searchParams.get("sort") || "latest",
  };

  // ✅ 필터 & 페이지 기반 상품 로딩
  useEffect(() => {
    const parsedFilters = {
      type: searchParams.get("type") || "",
      size: searchParams.get("size") || "",
      material: searchParams.get("material") || "",
      sort: searchParams.get("sort") || "latest",
    };

    fetchProducts(parsedFilters, page, limit);
    if (user) fetchFavorites();
  }, [searchParams, page, user, fetchProducts, fetchFavorites]);

  // ✅ 필터 변경 → 쿼리 업데이트
  const handleFilterChange = (original, mapped) => {
    setSearchParams({ ...mapped, page: "1" });
  };

  // ✅ 페이지 변경 → 쿼리 업데이트
  const handlePageChange = (newPage) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, page: newPage.toString() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-7xl mx-auto px-4">
        <ProductFilterBar
          title="🛍️ 제품 모아보기"
          filters={filters}
          onFilterChange={handleFilterChange}
          sortOptions={[
            { value: "latest", label: "최신순" },
            { value: "likes", label: "좋아요순" },
            { value: "name", label: "이름순" },
          ]}
        />

        {loading ? (
          <p className="text-gray-400 text-center py-10">
            ⏳ 제품을 불러오는 중이에요...
          </p>
        ) : products.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            😿 조건에 맞는 제품이 없어요
          </p>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  liked={favorites.includes(product.id)}
                  onToggleLike={() => toggleFavorite(product.id)}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProductsPage;