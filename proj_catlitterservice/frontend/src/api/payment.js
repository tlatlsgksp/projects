import axios from './axios';

// ✅ 내 Billing 정보 확인 (customerKey를 Toss에 넘길 때 사용)
export const getMyBilling = () => {
  return axios.get('/api/payments/billing/me');
};

// ✅ BillingKey 등록 후 구독 생성 (최초 구독 시 사용)
export const confirmBilling = (data) => {
  return axios.post('/api/payments/billing/confirm', data);
};

// ✅ 일회성 결제 후 결제 확인 (업그레이드 시 사용)
export const confirmPayment = (data) => {
  return axios.post('/api/payments/confirm', data);
};

