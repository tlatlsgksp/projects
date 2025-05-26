import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context

const PickupRequestPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order");

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span role="img" aria-label="pickup">📦</span>
            수거 요청하기
          </h2>
        </div>

        {/* 🚧 추후 RequestForm 컴포넌트 연결 예정 */}
        <div className="bg-white shadow-md rounded-xl p-6 text-center text-gray-500 text-sm">
          수거 요청 폼이 준비 중이에요.
        </div>
      </div>
    </motion.div>
  );
};

export default PickupRequestPage;