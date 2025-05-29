import React from "react";

const SubscriptionTierCard = ({
  tier,
  isCurrent = false,
  showButton = false,
  buttonLabel = "결제 후 구독하기",
  onClick = () => {},
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
      <div>
        {/* ✅ 이름 + 가격 */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">{tier.name}</h2>
        <span className="inline-block text-sm text-white bg-green-400 px-3 py-1 rounded-md mb-6">
          ₩{tier.price.toLocaleString()} / 월
        </span>

        {/* ✅ 월간 제공량 */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-5 mb-6">
          <h3 className="text-base font-bold text-gray-700 mb-3">🗓️ 월간 제공량</h3>
          <ul className="text-gray-700 text-sm space-y-1">
            <li>🚾 화장실: 최대 {tier.maxLitterboxesPerOrder}개</li>
            <li>🥄 삽: 최대 {tier.maxScoopsPerOrder ?? 0}개</li>
            <li>🏖️ 모래: 최대 {tier.monthlySandLimitLitre}L</li>
            <li>🧺 봉투: 최대 {tier.monthlyBagLimitLitre ?? 0}L</li>
            <li>🚚 수거 요청: 월 {tier.pickupPerMonth}회</li>
          </ul>
        </div>

        {/* ✅ 기타 안내 */}
        {tier.extra && (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm p-3 rounded mb-5 leading-relaxed">
            💡 {tier.extra}
          </div>
        )}

        {/* ✅ 로테이션 구조 안내 */}
        <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm p-3 rounded mb-5 leading-relaxed">
          ♻️ 최대 <strong>{tier.totalAssignedLitterboxes}</strong>개의 화장실이 제공돼요.<br/>(
          <strong>{tier.activeLitterboxes}</strong>개 사용 +{" "}
          {tier.totalAssignedLitterboxes - tier.activeLitterboxes}개 세척/대기용)
        </div>

        {/* ✅ 보증금 안내 */}
        {tier.depositRequired && tier.depositAmount && (
          <div className="bg-red-50 border border-red-100 text-red-800 text-sm p-3 rounded mb-5 leading-relaxed">
            💰 보증금: ₩{tier.depositAmount.toLocaleString()}<br />
            <span className="text-xs text-gray-600">(최초 등록 시 1회 결제)</span>
          </div>
        )}
      </div>

      {/* ✅ 하단 버튼 */}
      {showButton && (
        <button
          onClick={onClick}
          disabled={isCurrent}
          className="w-full bg-green-400 hover:bg-green-500 text-white py-2 rounded-md font-semibold transition shadow-md disabled:opacity-50"
        >
          {isCurrent ? "현재 구독중" : buttonLabel}
        </button>
      )}
    </div>
  );
};

export default SubscriptionTierCard;