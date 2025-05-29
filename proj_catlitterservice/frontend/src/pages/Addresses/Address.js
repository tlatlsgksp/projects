import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useAddress } from "../../context/AddressContext";

// ✅ Components
import { showConfirm } from "../../components/Utils/CustomConfirm";

const AddressPage = () => {
  const navigate = useNavigate();

  const {
    addresses,
    refreshAddresses,
    deleteAddressById,
    setAsDefaultAddress,
  } = useAddress();

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const handleDelete = (id) => {
    showConfirm({
      title: "주소 삭제",
      message: "정말 이 주소를 삭제할까요?",
      onConfirm: async () => {
        await deleteAddressById(id);
      },
    });
  };

  const handleSetDefault = async (id) => {
    await setAsDefaultAddress(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">🏠 주소 관리</h2>
          <button
            onClick={() => navigate("/mypage/addresses/new")}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            + 새 주소 추가
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-gray-500 text-center py-10">등록된 주소가 없어요.</p>
        ) : (
          <ul className="space-y-4">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="border border-gray-200 rounded-xl p-5 bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {addr.address1} {addr.address2}
                    </p>
                    <p className="text-sm text-gray-600">
                      ({addr.zipcode})
                    </p>

                    <div className="mt-2 space-x-2">
                      {addr.isDefault && (
                        <span className="inline-block text-xs font-medium bg-green-500 text-white px-2 py-1 rounded">
                          기본 주소
                        </span>
                      )}
                      {!addr.isServiceable && (
                        <span className="inline-block text-xs font-medium bg-red-100 text-red-600 border border-red-300 px-2 py-1 rounded">
                          ❌ 도서산간 지역 (배송 및 수거 불가)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm mt-1">
                    {!addr.isDefault && addresses.length > 1 && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-gray-600 hover:text-green-600"
                      >
                        기본 설정
                      </button>
                    )}
                    <button
                      onClick={() =>
                        navigate(`/mypage/addresses/${addr.id}/edit`)
                      }
                      className="text-green-600 hover:underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default AddressPage;