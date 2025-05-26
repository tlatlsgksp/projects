import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMyFavorites, likeProduct } from '../api/favorite';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const res = await getMyFavorites();
      const list = Array.isArray(res.data) ? res.data : [];
      setFavorites(list);
    } catch (err) {
      toast.error("좋아요 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const isFavorite = useCallback((productId) => {
    if (!productId) return false;
    return favorites.some((item) => item.id === productId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (productId) => {
    if (!isAuthenticated || !productId) return;

    try {
      await likeProduct(productId);
      await fetchFavorites();
    } catch (err) {
      toast.error("좋아요 변경에 실패했어요.");
    }
  }, [isAuthenticated, fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        fetchFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => useContext(FavoriteContext);