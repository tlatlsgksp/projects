import { createContext, useContext, useState, useCallback } from 'react';
import {
  getAllProducts,
  getProductById,
  getRecommendedProducts,
  getVariantsByProduct,
} from '../api/product';
import toast from 'react-hot-toast';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async (filters = {}, page = 1, limit = 12) => {
    setLoading(true);
    try {
      const res = await getAllProducts(filters, page, limit);
      setProducts(res.data.products || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      toast.error("제품 목록을 불러오는 데 실패했어요.");
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommended = useCallback(async () => {
    try {
      const res = await getRecommendedProducts();
      const list = Array.isArray(res.data) ? res.data : [];
      setRecommended(list);
    } catch {
      toast.error("추천 제품을 불러올 수 없어요.");
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    if (!id) return null;
    if (productMap[id]) return productMap[id];

    try {
      const res = await getProductById(id);
      setProductMap(prev => ({ ...prev, [id]: res.data }));
      return res.data;
    } catch {
      toast.error("제품 정보를 불러오지 못했어요.");
      return null;
    }
  }, [productMap]);

  const fetchVariantsByProduct = useCallback(async (productId) => {
    if (!productId) return [];

    try {
      const res = await getVariantsByProduct(productId);
      return res.data;
    } catch {
      toast.error("제품 옵션을 불러오지 못했어요.");
      return [];
    }
  }, []);

  const updateFavoriteCount = useCallback((productId, delta) => {
    setProductMap(prev => {
      const product = prev[productId];
      if (!product) return prev;

      const currentCount = product.favorites?.length || 0;
      const updatedProduct = {
        ...product,
        favorites: Array(currentCount + delta).fill({ id: 'dummy' }),
      };

      return {
        ...prev,
        [productId]: updatedProduct,
      };
    });
  }, []);

  return (
    <ProductContext.Provider value={{
      products,
      totalCount,
      recommended,
      productMap,
      loading,
      fetchProducts,
      fetchRecommended,
      fetchProductById,
      fetchVariantsByProduct,
      updateFavoriteCount
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);