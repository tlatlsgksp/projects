import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { usePayment } from "../context/PaymentContext";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { submitOneTimePayment } = usePayment();

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = Number(params.get("amount"));
    const tierId = Number(params.get("tierId"));

    if (!paymentKey || !orderId || !amount || !tierId) {
      navigate("/subscriptionssign");
      return;
    }

    submitOneTimePayment({ paymentKey, orderId, amount, tierId })
      .catch(() => navigate("/subscriptionssign"));
  }, [params, navigate, submitOneTimePayment]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">결제가 완료됐어요 🎉</h2>
        <p className="text-gray-700 mb-6">마이페이지에서 내 요금제를 확인해보세요!</p>
        <button
          onClick={() => navigate("/mypage")}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
        >
          마이페이지로 이동
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentSuccessPage;