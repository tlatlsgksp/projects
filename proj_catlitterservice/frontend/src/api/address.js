import axios from './axios';

// ✅ 주소 전체 목록 (내 주소 리스트)
export const getMyAddresses = () => {
  return axios.get('/api/addresses/me');
};

// ✅ 새 주소 추가
export const createAddress = (data) => {
  return axios.post('/api/addresses', data);
};

// ✅ 주소 수정
export const updateAddress = (id, data) => {
  return axios.put(`/api/addresses/${id}`, data);
};

// ✅ 주소 삭제
export const deleteAddress = (id) => {
  return axios.delete(`/api/addresses/${id}`);
};

// ✅ 기본 주소 설정
export const setDefaultAddress = (id) => {
  return axios.patch(`/api/addresses/${id}/default`);
};

// ✅ 어드민용 전체 주소 조회
export const getAllAddressesAdmin = () => {
  return axios.get('/api/addresses');
};