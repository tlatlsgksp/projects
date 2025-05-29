import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// ✅ Components
import PWAInstallButton from './PWAInstallButton';

// ✅ Context
import { useAuth } from "../../context/AuthContext";
import { useCart } from '../../context/CartContext';

function Header() {
  const { isAuthenticated, logout , loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const handleLogout = () => {
    navigate('/login');
    logout();
  };

  const handleLogin = () => {
    navigate("/login", { state: { from: location } });
  };

  if (loading) return null;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        {/* 왼쪽: 로고 + 메뉴 */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-extrabold text-orange-400 tracking-tight">
            🐾 똥냥이
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="text-gray-600 hover:text-green-600 transition">홈</Link>
            <Link to="/about" className="text-gray-600 hover:text-green-600 transition">서비스 소개</Link>
            <Link to="/products" className="text-gray-600 hover:text-green-600 transition">제품 모아보기</Link>
          </nav>
          <PWAInstallButton />
        </div>

        {/* 오른쪽: 계정 관련 메뉴 */}
        <div className="ml-auto flex items-center space-x-4 text-sm font-medium">
          {!isAuthenticated ? (
            <>
              <button
                onClick={handleLogin}
                className="px-3 py-1 border border-green-500 rounded-md text-green-600 shadow-md hover:bg-green-50 transition"
              >
                로그인
              </button>
              <Link
                to="/register"
                className="px-3 py-1 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
              >
                회원가입
              </Link>
            </>
          ) : (
            <>
              {/* ✅ 장바구니 버튼 */}
              <Link to="/cart" className="relative text-gray-600 hover:text-green-600">
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/mypage"
                className="px-3 py-1 border border-green-500 rounded-md text-green-600 shadow-md hover:bg-green-50 transition"
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
              >
                로그아웃
              </button>
            </>
          )}
          <button
            id="pwa-install-btn"
            style={{ display: 'none' }} // 👉 JS에서 보여지게 할 예정
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            📲 홈 화면에 추가
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
