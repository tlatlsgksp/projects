import axios from "./axios";

// ✅ 제품별 리뷰 목록 + 평균 별점
export const getReviewsByProduct = (productId) =>
  axios.get(`api/reviews/products/${productId}`);

// ✅ 리뷰 생성
export const createReview = (data) =>
  axios.post("api/reviews", data);

// ✅ 리뷰 수정
export const updateReview = (id, data) =>
  axios.patch(`api/reviews/${id}`, data);

// ✅ 리뷰 삭제
export const deleteReview = (id) =>
  axios.delete(`api/reviews/${id}`);