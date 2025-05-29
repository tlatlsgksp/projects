import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getMySubscription,
  cancelSubscription,
  downgradeSubscription,
  cancelDowngrade,
  revertCancelSubscription,
} from "../api/subscription";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getMySubscription();
      setSubscription(res.data);
    } catch (err) {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const requestCancel = useCallback(async (id) => {
    if (!isAuthenticated || !id) return;

    try {
      await cancelSubscription(id);
      toast.success("구독이 해지 예약되었어요.");
      fetchSubscription();
    } catch {
      toast.error("구독 해지에 실패했어요.");
    }
  }, [isAuthenticated, fetchSubscription]);

  const requestRevertCancel = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await revertCancelSubscription();
      toast.success("구독 해지를 철회했어요.");
      fetchSubscription();
    } catch {
      toast.error("철회 요청에 실패했어요.");
    }
  }, [isAuthenticated, fetchSubscription]);

  const requestDowngrade = useCallback(async (data) => {
    if (!isAuthenticated || !data) return;

    try {
      await downgradeSubscription(data);
      toast.success("다운그레이드가 예약되었어요.");
      fetchSubscription();
    } catch {
      toast.error("다운그레이드 요청에 실패했어요.");
    }
  }, [isAuthenticated, fetchSubscription]);

  const requestCancelDowngrade = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await cancelDowngrade();
      toast.success("다운그레이드 예약이 취소되었어요.");
      fetchSubscription();
    } catch {
      toast.error("다운그레이드 취소에 실패했어요.");
    }
  }, [isAuthenticated, fetchSubscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        fetchSubscription,
        requestCancel,
        requestRevertCancel,
        requestDowngrade,
        requestCancelDowngrade,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);