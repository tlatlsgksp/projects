import axios from "./axios";

// ✅ 내 구독 조회
export const getMySubscription = async () => {
  return axios.get('/api/subscriptions/me');
};

// ✅ 구독 취소 (PATCH 방식)
export const cancelSubscription = async (subscriptionId) => {
  return axios.patch(`/api/subscriptions/${subscriptionId}/cancel`);
};

// ✅ 다운그레이드 예약
export const downgradeSubscription = (data) => {
  return axios.post("/api/subscriptions/downgrade", data);
};

// ✅ 다운그레이드 예약 취소
export const cancelDowngrade = () => {
  return axios.post("/api/subscriptions/downgrade/cancel");
};

// ✅ 구독 취소 철회
export const revertCancelSubscription = () => {
  return axios.post("/api/subscriptions/revert-cancel");
};