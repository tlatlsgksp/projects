import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context


const ManagesPage = () => {
  const navigate = useNavigate();


  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span role="img" aria-label="orders">📑</span>
            주문 관리
          </h2>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 text-gray-600 text-sm text-center">
          주문 내역 관리 페이지가 준비 중이에요.
        </div>
      </div>
    </motion.div>
  );
};

export default ManagesPage;