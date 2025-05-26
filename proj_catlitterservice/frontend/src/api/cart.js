import axios from "./axios";

export const getMyCart = () => {
  return axios.get("/api/cart/me")
};

export const addCartItem = (productId, quantity = 1) => {
  return axios.post("/api/cart", { productId, quantity });
};

export const updateCartItem = (cartId, quantity) => {
  return axios.put(`/api/cart/${cartId}`, { quantity });
};

export const deleteCartItem = (cartId) => {
  return axios.delete(`/api/cart/${cartId}`);
};