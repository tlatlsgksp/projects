import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  createOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  getMonthlyUsage
} from "../api/order";
import { useAuth } from "./AuthContext";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [monthlyUsage, setMonthlyUsage] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const { isAuthenticated } = useAuth();

  const fetchMonthlyUsage = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMonthlyUsage();
      setMonthlyUsage(res.data);
    } catch (err) {
      toast.error("월간 사용량을 불러오지 못했어요.");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMonthlyUsage();
  }, [fetchMonthlyUsage]);

  const fetchMyOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMyOrders();
      setMyOrders(res.data);
    } catch (err) {
      toast.error("주문 내역을 불러오지 못했어요.");
    }
  }, [isAuthenticated]);

  const submitOrder = useCallback(async (orderData) => {
    if (
      !isAuthenticated ||
      !orderData?.addressId ||
      !Array.isArray(orderData?.orderItems) ||
      orderData.orderItems.length === 0
    ) {
      toast.error("주문 정보가 올바르지 않아요.");
      return;
    }

    try {
      const res = await createOrder(orderData);
      toast.success("주문이 완료되었어요!");
      return res.data;
    } catch (err) {
      toast.error("주문에 실패했어요.");
      throw err;
    }
  }, [isAuthenticated]);

  const fetchOrderById = useCallback(async (orderId) => {
    if (!isAuthenticated || !orderId || isNaN(orderId)) return null;

    try {
      const res = await getOrderById(orderId);
      return res.data;
    } catch (err) {
      toast.error("주문 상세 정보를 불러오지 못했어요.");
      return null;
    }
  }, [isAuthenticated]);

  const handleCancelOrder = useCallback(async (orderId) => {
    if (!isAuthenticated || !orderId || isNaN(orderId)) return;

    try {
      await cancelOrder(orderId);
      toast.success("주문이 취소되었어요.");
      await fetchMyOrders();
    } catch (err) {
      toast.error("주문 취소에 실패했어요.");
    }
  }, [isAuthenticated, fetchMyOrders]);

  return (
    <OrderContext.Provider
      value={{
        monthlyUsage,
        fetchMonthlyUsage,
        submitOrder,
        myOrders,
        fetchMyOrders,
        handleCancelOrder,
        fetchOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);