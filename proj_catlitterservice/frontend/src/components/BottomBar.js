import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import OrdersForm from './OrdersForm';
import LikeButton from '../components/LikeButton';
import { useOrderPanel } from '../context/OrderPanelContext';

const BottomBar = ({
  showFavorite = false,
  showApply = false,
  productId = null,
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, open, close } = useOrderPanel();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleApplyClick = () => {
    if (isMobile) {
      navigate('/orders/new');
    } else {
      open();
    }
  };

  const isProductDetailPage = /^\/products\/\d+$/.test(location.pathname);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-4 py-3 shadow-md flex justify-center items-center gap-3 sm:px-10">
        {/* ❤️ 좋아요 버튼 */}
        {showFavorite && productId && (
          <LikeButton
            key={location.pathname}
            productId={productId}
            className="w-auto px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
          />
        )}

        {/* 📦 신청하기 버튼 */}
        {showApply &&
          (isAuthenticated ? (
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium"
              onClick={handleApplyClick}
            >
              신청하기
            </button>
          ) : (
            <Link to="/login" state={{ from: location }} className="flex-1">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium">
                로그인 후 신청하기
              </button>
            </Link>
          ))}

        {/* 🛒 장바구니 담기 */}
        {isProductDetailPage &&
          (isAuthenticated ? (
            <button
              onClick={() =>
                document.getElementById('add-to-cart-button')?.click()
              }
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium"
            >
              장바구니 담기
            </button>
          ) : (
            <Link to="/login" state={{ from: location }} className="flex-1">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium">
                로그인 후 담기
              </button>
            </Link>
          ))}
      </div>

      {/* 💻 PC 슬라이드 주문 패널 */}
      {isOpen && !isMobile && (
        <div className="fixed bottom-0 right-0 w-[500px] h-[80vh] bg-white border-l shadow-xl rounded-tl-xl p-6 z-50 animate-slide-up overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">📦 신청하기</h2>
          </div>
          <OrdersForm
            key={location.pathname}
            onComplete={close}
            onCancel={close}
          />
        </div>
      )}
    </>
  );
};

export default BottomBar;