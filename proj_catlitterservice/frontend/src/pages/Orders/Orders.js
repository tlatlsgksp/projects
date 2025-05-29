import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useOrder } from "../../context/OrderContext";

// ✅ Component
import { showConfirm } from "../../components/Utils/CustomConfirm";
import ImageWithFallback from "../../components/Utils/ImageWithFallback";

// ✅ 상태 라벨 한글 변환 함수
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

const isOrderCancellable = (status) => status === "PENDING";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { myOrders, fetchMyOrders, handleCancelOrder } = useOrder();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
        <h2 className="text-2xl font-bold">📦 주문 내역</h2>

        {myOrders.length === 0 ? (
          <p className="text-gray-500">주문 내역이 없어요.</p>
        ) : (
          myOrders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">주문 번호 #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} / 상태:{" "}
                    <span className="font-medium">{getOrderStatusLabel(order.status)}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="text-sm px-3 py-1 border rounded text-green-700 border-green-300 hover:bg-green-50"
                  >
                    상세보기
                  </button>

                  {isOrderCancellable(order.status) && (
                    <button
                      onClick={() => {
                        showConfirm({
                          title: "주문 취소",
                          message: (
                            <>
                              이 주문을 정말 <span className="font-semibold text-red-500">취소</span>하시겠어요?
                              <br />취소한 주문은 되돌릴 수 없어요.
                            </>
                          ),
                          onConfirm: () => handleCancelOrder(order.id),
                        });
                      }}
                      className="text-sm px-3 py-1 border rounded text-red-600 border-red-300 hover:bg-red-50"
                    >
                      주문 취소
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-md p-2"
                  >
                    <ImageWithFallback
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded object-cover border"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-gray-500">수량: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default OrdersPage;