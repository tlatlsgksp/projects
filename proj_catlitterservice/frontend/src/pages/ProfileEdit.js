import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useAuth } from "../context/AuthContext";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, updateUser, updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    phone: "",
  });
  const [original, setOriginal] = useState({ name: "", phone: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const { username, email, name, phone } = user;
    setFormData({ username, email, name, phone });
    setOriginal({ name, phone });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const hasChanges =
      formData.name !== original.name ||
      formData.phone !== original.phone ||
      currentPassword || newPassword || confirmPassword;

    if (!hasChanges) {
      setError("변경된 내용이 없어요");
      return;
    }

    try {
      if (formData.name !== original.name || formData.phone !== original.phone) {
        await updateUser({ name: formData.name, phone: formData.phone });
      }

      if (currentPassword || newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          setError("새 비밀번호가 일치하지 않아요");
          return;
        }

        await updatePassword({
          currentPassword,
          newPassword,
        });
      }

      setMessage("정보가 성공적으로 수정됐어요!");
      setTimeout(() => navigate("/mypage"), 1500);
    } catch (err) {
      setError("수정 중 오류가 발생했어요");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
        <div className="text-center mb-10">
          <p className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent mb-3">
            내정보 수정
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">아이디</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              disabled
              className="p-2 border w-full rounded bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label className="block font-medium">이메일</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              disabled
              className="p-2 border w-full rounded bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block font-medium">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="p-2 border w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">전화번호</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="p-2 border w-full rounded"
            />
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-gray-700">비밀번호 변경 (선택)</h3>
          <input
            type="password"
            placeholder="현재 비밀번호"
            className="p-2 border w-full rounded"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="새 비밀번호"
            className="p-2 border w-full rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            className="p-2 border w-full rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
            저장
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
        </form>
      </div>
    </motion.div>
  );
};

export default ProfileEditPage;