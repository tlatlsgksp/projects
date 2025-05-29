import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentFailPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const errorMsg =
    params.get("message") || "결제가 정상적으로 처리되지 않았습니다.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">!</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">결제에 실패했습니다</h2>
        <p className="text-gray-600 mb-6">
          {errorMsg}
          <br />
          다시 시도해 주세요.
        </p>
        <button
          onClick={() => navigate("/subscriptionssign")}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
        >
          요금제 페이지로 돌아가기
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentFailPage;