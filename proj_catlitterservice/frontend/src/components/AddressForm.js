import React, { useState } from "react";
import DaumPostcodeEmbed from "react-daum-postcode";
import { useAddress } from "../context/AddressContext";

const AddressForm = ({ onSubmit, onCancel, initialData = {}, isEditing = false }) => {
  const { addresses } = useAddress(); // 주소 수 확인

  const [form, setForm] = useState({
    address1: initialData.address1 || "",
    address2: initialData.address2 || "",
    zipcode: initialData.zipcode || "",
    isDefault: initialData.isDefault || false,
  });

  const [showPostcode, setShowPostcode] = useState(false);

  const handleComplete = (data) => {
    const fullAddress = data.address;
    const zonecode = data.zonecode;

    setForm(prev => ({
      ...prev,
      address1: fullAddress,
      zipcode: zonecode,
    }));
    setShowPostcode(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    const payload = { ...form };

    if (addresses.length === 0) {
      payload.isDefault = true;
    }

    await onSubmit(payload);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        🏠 주소 입력
      </h3>

      {/* 주소 검색 */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">주소 검색</label>
        <div className="flex gap-2">
          <input
            type="text"
            name="address1"
            value={form.address1}
            readOnly
            placeholder="주소를 검색하세요"
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
          <button
            type="button"
            onClick={() => setShowPostcode(true)}
            className="px-4 py-2 bg-green-600 text-white w-auto rounded hover:bg-green-700 transition min-w-[80px]"
          >
            검색
          </button>
        </div>
        {showPostcode && (
          <div className="mt-4 border border-gray-300 rounded overflow-hidden">
            <DaumPostcodeEmbed onComplete={handleComplete} />
          </div>
        )}
      </div>

      {/* 우편번호 */}
      <div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">우편번호</label>
          <input
            type="text"
            name="zipcode"
            value={form.zipcode}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>
      </div>

      {/* 상세 주소 */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">상세 주소</label>
        <input
          type="text"
          name="address2"
          value={form.address2}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* 기본 주소 체크박스 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          name="isDefault"
          checked={addresses.length === 0 ? true : form.isDefault}
          onChange={addresses.length === 0 ? undefined : handleChange}
          disabled={addresses.length === 0}
          className="accent-green-600"
        />
        <span>기본 배송지로 설정</span>
      </div>


      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {isEditing ? "주소 수정" : "주소 추가"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressForm;