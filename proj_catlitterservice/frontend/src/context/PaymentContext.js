import { createContext, useContext, useState, useCallback } from "react";
import {
  getMyBilling,
  confirmBilling,
  confirmPayment,
} from "../api/payment";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [billingInfo, setBillingInfo] = useState(undefined);
  const { isAuthenticated } = useAuth();

  const fetchBillingInfo = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await getMyBilling();
      setBillingInfo(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setBillingInfo(null);
      } else {
        toast.error("결제 정보를 불러오지 못했어요.");
      }
    }
  }, [isAuthenticated]);

  const submitBilling = useCallback(async (data) => {
    if (!isAuthenticated || !data) return;

    try {
      const res = await confirmBilling(data);
      toast.success("구독 결제가 완료되었어요.");
      await fetchBillingInfo(); // billingKey 갱신
      return res.data;
    } catch {
      toast.error("결제에 실패했어요.");
      throw new Error();
    }
  }, [isAuthenticated, fetchBillingInfo]);

  const submitOneTimePayment = useCallback(async (data) => {
    if (!isAuthenticated || !data) return;

    try {
      const res = await confirmPayment(data);
      toast.success("결제가 완료되었어요.");
      return res.data;
    } catch {
      toast.error("결제에 실패했어요.");
      throw new Error();
    }
  }, [isAuthenticated]);

  return (
    <PaymentContext.Provider
      value={{
        billingInfo,
        fetchBillingInfo,
        submitBilling,
        submitOneTimePayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);