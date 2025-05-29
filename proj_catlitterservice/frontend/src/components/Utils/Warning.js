import React from "react";

const Warning = () => {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-5 rounded-xl mb-6 shadow-sm leading-relaxed space-y-2">
      <strong className="text-yellow-700 text-base">⚠️ 도서산간 지역 안내</strong>
      <p>
        <span className="font-semibold text-red-600">도서산간 지역</span>은 서비스 제공이 불가한 지역입니다.
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-medium">해당 내용의 미확인으로 인해 발생하는 서비스 제한 및 결제 관련 불이익</span>에 대해서는
        <span className="font-medium"> 당사가 책임지지 않음을 안내드립니다.</span>
      </p>
    </div>
  );
};

export default Warning;