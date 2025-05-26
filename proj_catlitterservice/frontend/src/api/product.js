import axios from "./axios";

// 제품 리스트 가져오기
export const getAllProducts = async (filters, page = 1, limit = 12) => {
  const params = { ...filters, page, limit };
  return axios.get('/api/products', { params });
};

// 추천 제품 가져오기
export const getRecommendedProducts = async () => {
  return axios.get("/api/products/recommended");
};

// ✅ 특정 제품의 변형(variants) 리스트 가져오기
export const getVariantsByProduct = (productId) => {
  return axios.get(`/api/products/${productId}/variants`);
};

// 제품 상세 정보
export const getProductById = async (id) => {
  return axios.get(`/api/products/${id}`);
};