import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// ✅ Context
import { useAuth } from '../../context/AuthContext';
import { useFavorite } from '../../context/FavoriteContext';
import { useProduct } from '../../context/ProductContext';

const LikeButton = ({ productId, className = '' }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorite();
  const { fetchProductById, updateFavoriteCount } = useProduct();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!productId) return;

      try {
        const product = await fetchProductById(productId);
        setCount(product.favorites?.length || 0);

        if (isAuthenticated) {
          setLiked(isFavorite(productId));
        }
      } catch {
        toast.error('좋아요 정보를 불러오지 못했어요.');
      }
    };

    loadInitialData();
  }, [productId, isAuthenticated, isFavorite, fetchProductById]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요');
      return;
    }

    const prevLiked = liked;
    const nextLiked = !prevLiked;
    const delta = nextLiked ? 1 : -1;

    setLiked(nextLiked);
    setCount(prev => prev + delta);
    updateFavoriteCount(productId, delta);

    try {
      await toggleFavorite(productId);
    } catch {
      setLiked(prevLiked);
      setCount(prev => prev + (prevLiked ? 1 : -1));
      updateFavoriteCount(productId, prevLiked ? 1 : -1);
      toast.error('좋아요 처리 실패');
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      className={`flex items-center gap-1 text-lg ${className}`}
      aria-label="좋아요 버튼"
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span className="text-sm text-gray-600">{count}</span>
    </button>
  );
};

export default LikeButton;