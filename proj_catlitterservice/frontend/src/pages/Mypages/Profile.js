import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">🔐 내 정보</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 mb-1">이름</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 mb-1">전화번호</p>
            <p className="font-medium">{user.phone || "없음"}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 mb-1">아이디</p>
            <p className="font-medium">{user.username}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 mb-1">이메일</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => navigate("/mypage/profile/edit")}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              정보 수정
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;