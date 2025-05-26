import axios from "./axios";

// 좋아요 토글
export const likeProduct = async (productId) => {
  return axios.post(`/api/users/me/favorites/${productId}`);
};

// 내 좋아요 목록 조회
export const getMyFavorites = async () => {
  return axios.get("/api/users/me/favorites");
};