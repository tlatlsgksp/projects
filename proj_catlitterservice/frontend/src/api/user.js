import axios from './axios';

// 현재 사용자 정보 조회
export const getCurrentUser = async () => {
  return axios.get('/api/users/me');
};

// 사용자 정보 수정
export const updateUserInfo = async (data) => {
  return axios.patch("/api/users/me", data);
};

// 비밀번호 변경
export const changePassword = async (data) => {
  return axios.patch("/api/users/me/password", data);
};