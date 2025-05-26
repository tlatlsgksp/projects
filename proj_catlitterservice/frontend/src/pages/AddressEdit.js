import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useAddress } from "../context/AddressContext";

// ✅ Components
import AddressForm from "../components/AddressForm";

const AddressEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addressId = Number(id);

  const { addresses, updateAddressById } = useAddress();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const target = addresses.find((addr) => addr.id === addressId);
    if (target) {
      setInitialData(target);
    } else {
      navigate("/mypage/addresses");
    }
  }, [addresses, addressId, navigate]);

  const handleSubmit = async (formData) => {
    await updateAddressById(addressId, formData);
    navigate("/mypage/addresses");
  };

  const handleCancel = () => {
    navigate("/mypage/addresses");
  };

  if (!initialData) {
    return (
      <div className="text-center py-10 text-gray-500">
        주소 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🏠 주소 수정</h2>
        <AddressForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
          isEditing
        />
      </div>
    </motion.div>
  );
};

export default AddressEditPage;