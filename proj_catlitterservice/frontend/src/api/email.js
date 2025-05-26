import axios from "./axios";

export const sendVerificationCode = async (email) => {
  return axios.post("/api/email/send", { email });
};

export const verifyCode = async (email, code) => {
  return axios.post("/api/email/verify", { email, code });
};