import axios from './axios';

// ✅ 단일 주문 상세 조회
export const getOrderById = async (orderId) => {
  return axios.get(`/api/orders/${orderId}`);
};

// ✅ 전체 주문 목록 조회
export const getAllOrders = async () => {
  return axios.get('/api/orders/admin/all');
};

// ✅ 주문 생성
export const createOrder = async (orderData) => {
  return axios.post('/api/orders', orderData);
};

// ✅ 주문 취소
export const cancelOrder = async (orderId) => {
  return axios.patch(`/api/orders/${orderId}/cancel`);
};

// ✅ 내 주문 목록 조회
export const getMyOrders = async () => {
  return axios.get('/api/orders/me');
};

// ✅ 월간 사용량 조회
export const getMonthlyUsage = async () => {
  return axios.get('/api/orders/monthly-usage');
};