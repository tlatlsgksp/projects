import React, { useEffect, useState } from 'react';
import { likeProduct, getMyFavorites } from '../api/favorite';
import { getProductById } from '../api/product';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LikeButton = ({ productId, className = '' }) => {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadLikeInfo = async () => {
      if (!productId) return;
      try {
        const productRes = await getProductById(productId);
        setCount(productRes.data.favorites?.length || 0);
        if (isAuthenticated) {
          const favRes = await getMyFavorites();
          const likedIds = favRes.data.map((item) => item.id);
          setLiked(likedIds.includes(productId));
        }
      } catch {
      }
    };

    loadLikeInfo();
  }, [productId, isAuthenticated]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요');
      return;
    }

    try {
      const res = await likeProduct(productId);
      const isLiked = res.data.liked;
      setLiked(isLiked);
      setCount((prev) => prev + (isLiked ? 1 : -1));
    } catch {
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