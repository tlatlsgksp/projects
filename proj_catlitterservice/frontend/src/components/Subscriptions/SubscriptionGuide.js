import React from "react";

const SubscriptionGuide = () => {
  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-700 space-y-10 leading-relaxed shadow-sm">
      <section>
        <h4 className="text-base text-green-600 font-bold mb-4 border-b pb-2 border-gray-200">📦 제품 제공</h4>
        <p>
          요금제에 따라 <span className="font-semibold text-gray-800">매월 정해진 제공량 한도</span> 내에서 원하는 제품을 자유롭게 선택할 수 있어요.<br />
          구성에 따라 <span className="font-semibold">화장실, 모래, 봉투, 삽</span> 등의 품목이 제공돼요.
        </p>
      </section>

      <section>
        <h4 className="text-base text-green-600 font-bold mb-4 border-b pb-2 border-gray-200">💰 보증금 안내</h4>
        <p>
          모든 요금제는 <span className="font-semibold text-gray-800">화장실 회전 관리를 위한 보증금</span>이 포함돼요.
          <br />구독 시작 시 1회 납부되며, <span className="font-semibold">구독 해지 및 장비 반납 완료 후 전액 환불</span>돼요.
        </p>
        <p>
          보증금은 요금제에 따라 다르며, 사용자가 파손이나 분실 없이 정상 반납하면 자동으로 반환돼요.
        </p>
      </section>

      <section>
        <h4 className="text-base text-green-600 font-bold mb-4 border-b pb-2 border-gray-200">🔁 로테이션 방식 운영</h4>
        <p>
          사용자가 수거 요청 일자를 지정하면 <span className="font-semibold">전문 기사가 방문</span>해
          <span className="font-semibold"> 현재 사용 중인 화장실을 동일한 모델의 세척 완료된 화장실로 교체</span>해줘요.
        </p>
        <p>
          수거된 화장실은 <span className="font-semibold">전문 세척</span> 후 다음 주기에 맞춰 다시 공급되고,
          항상 동일한 제품이 <span className="font-semibold">로테이션 방식</span>으로 관리돼요.
        </p>
        <p>
          모래는 고객이 사전에 선택한 양만큼 정기 배송되며, 교체가 필요한 경우에만 기사 방문 요청이 가능해요.
        </p>
        <p className="mt-2">
          로테이션 운영을 위해 요금제별로 다음과 같이 화장실이 배정돼요:
        </p>
        <ul className="space-y-1 text-gray-700 pl-5">
          <li>✔️ <span className="font-semibold">소형 요금제</span>: 최대 2개 (1개 사용 + 1개 세척 대기)</li>
          <li>✔️ <span className="font-semibold">중형 요금제</span>: 최대 4개 (2개 사용 + 2개 세척 대기)</li>
          <li>✔️ <span className="font-semibold">대형 요금제</span>: 최대 8개 (4개 사용 + 4개 세척 대기)</li>
        </ul>
      </section>

      <section>
        <h4 className="text-base text-green-600 font-bold mb-4 border-b pb-2 border-gray-200">🚽 제품 유지 및 변경</h4>
        <p>
          사용 중인 화장실과 삽은 <span className="font-semibold">지속적으로 재사용</span>하는 구조예요.
        </p>
        <p>
          <span className="font-semibold text-gray-800">제품 변경은 연 1회</span> 요청할 수 있고,
          <span className="text-red-500 font-semibold"> 추가 비용</span>이 발생할 수 있어요.
        </p>
      </section>

      <section>
        <h4 className="text-base text-green-600 font-bold mb-4 border-b pb-2 border-gray-200">🛠️ 파손 및 교환</h4>
        <p>
          제품이 파손된 경우엔 <span className="font-semibold">사진과 함께 1:1 문의 또는 고객센터</span>로 요청해 주세요.
          <br />확인 후 <span className="font-semibold">무상 또는 유상 교환 여부</span>를 안내해드려요.
        </p>
      </section>

      <section>
        <h4 className="text-base text-green-600 font-bold mb-4 border-b pb-2 border-gray-200">📦 수거 요청</h4>
        <p>
          수거는 사용자가 원하는 날짜에 예약할 수 있고,
          <span className="font-semibold"> 전문 기사가 방문해서 화장실 교체 또는 수거를 직접 진행</span>해요.
        </p>
        <p>
          고객이 직접 청소하거나 폐기물을 처리할 필요 없이,
          <span className="font-semibold"> 깨끗한 제품으로 자동 교체</span>돼요.
        </p>
      </section>

      <section>
        <h4 className="text-base text-green-600 font-bold mb-4 border-b pb-2 border-gray-200">⏱️ 제공량 정책</h4>
        <p>
          모든 제공량은 <span className="font-semibold">매월 1일 기준으로 자동 초기화</span>되며,
          <span className="font-semibold text-gray-800"> 남은 수량은 이월되지 않아요.</span>
        </p>
      </section>
    </div>
  );
};

export default SubscriptionGuide;