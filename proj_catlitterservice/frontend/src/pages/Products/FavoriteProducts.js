import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

// ✅ Context
import { useAuth } from "../../context/AuthContext";
import { useFavorite } from "../../context/FavoriteContext";

// ✅ Components
import ProductCard from "../../components/Products/ProductCard";
import ProductFilterBar from "../../components/Products/ProductFilterBar";
import Pagination from "../../components/Utils/Pagination";

const FavoriteProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { loading: authLoading } = useAuth();
  const { favorites, fetchFavorites, toggleFavorite } = useFavorite();

  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 10;
  const totalPages = Math.ceil(filtered.length / limit);
  const currentPageItems = filtered.slice((page - 1) * limit, page * limit);

  const filters = useMemo(() => ({
    type: searchParams.get("type") || "",
    size: searchParams.get("size") || "",
    material: searchParams.get("material") || "",
    sort: searchParams.get("sort") || "latest",
  }), [searchParams]);

  // ✅ 좋아요 목록 로드
  useEffect(() => {
    if (!authLoading) {
      setLoading(true);
      fetchFavorites().finally(() => setLoading(false));
    }
  }, [authLoading, fetchFavorites]);

  // ✅ 필터 적용
  useEffect(() => {
    let list = [...favorites];

    if (filters.type) list = list.filter((item) => item.type === filters.type);
    if (filters.size) list = list.filter((item) => item.size === filters.size);
    if (filters.material) list = list.filter((item) => item.material === filters.material);

    if (filters.sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => {
        if (!a.likedAt || !b.likedAt) return 0;
        return new Date(b.likedAt) - new Date(a.likedAt);
      });
    }

    setFiltered(list);
  }, [favorites, filters]);

  const handleToggleLike = async (productId) => {
    await toggleFavorite(productId);
  };

  const handleFilterChange = (original, mapped) => {
    setSearchParams({ ...mapped, page: "1" });
  };

  const handlePageChange = (newPage) => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, page: newPage.toString() });
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
          title="❤️ 좋아요한 제품"
          filters={filters}
          onFilterChange={handleFilterChange}
          sortOptions={[
            { value: "latest", label: "최근 좋아요 순" },
            { value: "name", label: "이름순" },
          ]}
        />

        {loading ? (
          <p className="text-gray-400 text-center py-10">
            ⏳ 좋아요한 제품을 불러오는 중이에요...
          </p>
        ) : currentPageItems.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            😿 좋아요한 제품이 없어요
          </p>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {currentPageItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  liked={true}
                  onToggleLike={handleToggleLike}
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

export default FavoriteProductsPage;