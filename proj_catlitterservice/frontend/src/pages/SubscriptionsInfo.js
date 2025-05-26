import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useSubscription } from "../context/SubscriptionContext";

const SubscriptionsInfoPage = () => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  const calculateNextBillingDate = (startDate) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold">💳 멤버십 정보</h2>
          <button
            onClick={() => navigate("/subscriptionssign")}
            className="text-sm text-blue-600 hover:underline"
          >
            요금제 수정
          </button>
        </div>

        {!subscription ? (
          <p className="text-gray-500">현재 구독 중인 요금제가 없어요.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">요금제</p>
              <p className="font-semibold">{subscription.tier.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">가격</p>
              <p className="font-semibold">
                {subscription.tier.price.toLocaleString()}원 /월
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">모래 용량</p>
              <p className="font-semibold">
                {subscription.tier.monthlySandLimitLitre}L
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">봉투 용량</p>
              <p className="font-semibold">
                {subscription.tier.monthlyBagLimitLitre}L
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">화장실 갯수</p>
              <p className="font-semibold">
                {subscription.tier.maxLitterboxesPerOrder}개
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">삽 갯수</p>
              <p className="font-semibold">
                {subscription.tier.maxScoopsPerOrder}개
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">수거 횟수</p>
              <p className="font-semibold">
                월 {subscription.tier.pickupPerMonth}회
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">비고</p>
              <p className="font-semibold">
                {subscription.tier.extra || "없음"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">시작일</p>
              <p className="font-semibold">
                {new Date(subscription.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">다음 결제일</p>
              <p className="font-semibold">
                {calculateNextBillingDate(subscription.startDate)}
              </p>
            </div>

            {subscription.willCancel && (
              <div className="bg-yellow-100 text-yellow-800 font-medium rounded-lg p-3 col-span-2">
                📌 구독이 해지 예약되었어요. 이 구독은{" "}
                <strong>
                  {subscription.endDate
                    ? new Date(subscription.endDate).toLocaleDateString()
                    : "다음 결제일"}
                </strong>{" "}
                까지 이용 가능해요.
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
              <p className="text-gray-500">상태</p>
              <p
                className={`font-bold ${
                  subscription.isActive
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {subscription.isActive ? "활성화됨" : "해지됨"}
              </p>
            </div>

            <div className="text-sm text-gray-500 col-span-2 text-center mt-2">
              📅 구독은 매월 자동 갱신되며, 해지 예약 시 다음 결제일 이후 만료돼요.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionsInfoPage;