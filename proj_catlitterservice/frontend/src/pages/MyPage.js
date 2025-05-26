import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Context
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";

// ✅ Components
import MonthlyUsageSummary from "../components/MonthlyUsageSummary";

const MyPage = () => {
  const [showUsage, setShowUsage] = useState(true);
  const { subscription } = useCart();
  const { monthlyUsage, fetchMonthlyUsage } = useOrder();

  useEffect(() => {
    fetchMonthlyUsage();
  }, [fetchMonthlyUsage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* 마이페이지 메뉴 카드 */}
        <div className="bg-white border rounded-xl p-6 mb-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">👤 마이페이지</h2>
        </div>

        {monthlyUsage && subscription?.tier && (
          <div className="bg-white rounded-xl border p-6 mb-10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">📦 월간 사용량</h2>
              <button
                onClick={() => setShowUsage(!showUsage)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showUsage ? "🔼" : "🔽"}
              </button>
            </div>

            <AnimatePresence>
              {showUsage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <MonthlyUsageSummary
                    usage={monthlyUsage}
                    subscriptionTier={subscription.tier}
                    cart={[]}
                    showTitle={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Link to="/mypage/profile" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold mb-1">🔐 내 정보</h3>
            <p className="text-sm text-gray-500">이름, 전화번호, 이메일 등 기본 정보</p>
          </Link>

          <Link to="/mypage/subscriptionsinfo" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold mb-1">💳 멤버십 정보</h3>
            <p className="text-sm text-gray-500">현재 사용 중인 요금제 확인 및 수정</p>
          </Link>

          <Link to="/mypage/orders" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold mb-1">📝 주문 내역</h3>
            <p className="text-sm text-gray-500">주문 내역 확인, 상세 조회 및 주문 취소</p>
          </Link>

          <Link to="/mypage/addresses" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold mb-1">🏠 주소 관리</h3>
            <p className="text-sm text-gray-500">배송/수거 주소 등록 및 기본 주소 설정</p>
          </Link>

          <Link to="/mypage/favorites" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold mb-1">❤️ 찜한 제품</h3>
            <p className="text-sm text-gray-500">좋아요한 제품을 확인하고 주문하기</p>
          </Link>

          <Link to="/mypage/reviews" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold mb-1">⭐ 내가 쓴 리뷰</h3>
            <p className="text-sm text-gray-500">작성한 리뷰 관리 및 삭제</p>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default MyPage;