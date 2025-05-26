import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useAddress } from "../context/AddressContext";

// ✅ Components
import AddressForm from "../components/AddressForm";

const AddressNewPage = () => {
  const navigate = useNavigate();
  const { addNewAddress } = useAddress();

  const handleSubmit = async (formData) => {
    const newAddress = await addNewAddress(formData);
    if (newAddress) {
      navigate("/mypage/addresses");
    }
  };

  const handleCancel = () => {
    navigate("/mypage/addresses");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🏠 새 주소 추가</h2>
        <AddressForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </motion.div>
  );
};

export default AddressNewPage;