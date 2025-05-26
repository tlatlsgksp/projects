import axios from "axios";
import { toast } from "react-hot-toast";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      toast.remove();
      toast.error("로그인이 만료됐어요. 다시 로그인해주세요!");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default instance;