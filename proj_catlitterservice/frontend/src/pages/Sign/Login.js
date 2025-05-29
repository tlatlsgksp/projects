import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const { loginWithToken } = useAuth();
  const { refreshCart, refreshSubscription } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await loginWithToken(username, password);
      await refreshCart();
      await refreshSubscription();
      navigate(from, { replace: true });
    } catch {
    }
  };

  const handleSignUpClick = () => {
    navigate("/register");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-md mx-auto">
        <div className="w-full max-w-md space-y-6">
          {/* 🔐 로그인 제목 박스 */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span role="img" aria-label="login">🔐</span>
              로그인
            </h2>
          </div>

          {/* 로그인 폼 박스 */}
          <div className="w-full bg-white shadow-xl rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">아이디</label>
                <input
                  type="text"
                  placeholder="아이디"
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">비밀번호</label>
                <input
                  type="password"
                  placeholder="비밀번호"
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-2 rounded-md shadow-md transition-all"
              >
                로그인
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">아직 계정이 없으신가요?</p>
              <button
                onClick={handleSignUpClick}
                className="mt-2 text-blue-500 hover:text-blue-600 hover:underline text-sm font-medium"
              >
                회원가입 하러가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;