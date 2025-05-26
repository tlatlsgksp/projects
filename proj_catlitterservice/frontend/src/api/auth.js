import axios from './axios';

// 로그인
export const login = async (username, password) => {
  return axios.post("/api/auth/login", { username, password });
};

export const register = async (formData) => {
  const email = `${formData.emailLocal}@${formData.emailDomain}`;
  return axios.post("/api/auth/register", { ...formData, email });
};

export const checkUsername = async (username) => {
  return axios.post("/api/check/username", { username });
};

export const checkEmail = async (email) => {
  return axios.post("/api/check/email", { email });
};