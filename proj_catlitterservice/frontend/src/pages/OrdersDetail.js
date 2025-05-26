import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useOrder } from "../context/OrderContext";

// ✅ Component
import ImageWithFallback from "../components/ImageWithFallback";

// ✅ 상태 한글 라벨 변환 함수
const getOrderStatusLabel = (status) => {
  switch (status) {
    case "PENDING":
      return "주문 접수";
    case "DELIVERING":
      return "배송 중";
    case "DELIVERED":
      return "배송 완료";
    case "PICKUP_REQUESTED":
      return "수거 요청됨";
    case "PICKED_UP":
      return "수거 완료";
    case "CANCELLED":
      return "취소됨";
    default:
      return status;
  }
};

// ✅ 주소 포맷 유틸 함수
const formatAddress = (address) => {
  if (!address) return "주소 정보 없음";
  const parts = [
    address.address1,
    address.address2,
    address.zipcode  ? `(${address.zipcode })` : "",
  ].filter(Boolean);
  return parts.join(" ");
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchOrderById } = useOrder();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchOrderById(id);
      if (!result) {
        navigate("/mypage/orders");
      } else {
        setOrder(result);
      }
      setLoading(false);
    };

    fetchData();
  }, [id, fetchOrderById, navigate]);

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-gray-500">불러오는 중...</div>
    );
  }

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
        <h2 className="text-2xl font-bold">📦 주문 상세</h2>

        <div className="text-sm space-y-1">
          <p><strong>주문 번호:</strong> #{order.id}</p>
          <p><strong>상태:</strong> {getOrderStatusLabel(order.status)}</p>
          <p><strong>주문일:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          {order.deliveryDate && (
            <p><strong>배송일:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
          )}
          <p><strong>주소:</strong> {formatAddress(order.address)}</p>
        </div>

        {order.pickupRequested && (
          <div className="bg-gray-50 border p-4 rounded">
            <p className="text-sm text-gray-700 font-semibold">🧹 수거 요청</p>
            <p className="text-sm text-gray-600 mt-1">
              {order.pickupRequest?.note || "메모 없음"}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 border-b pb-1">🛒 제품 목록</h4>
          {order.orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border rounded-md p-2"
            >
              <ImageWithFallback
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded border"
              />
              <div>
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-gray-500">수량: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate("/mypage/orders")}
            className="text-sm px-4 py-2 border rounded text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            목록으로
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetailPage;