import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Context
import { useCart } from "../../context/CartContext";
import { useOrder } from "../../context/OrderContext";
import { useOrderPanel } from "../../context/OrderPanelContext";

// ✅ Components
import ImageWithFallback from "../../components/Utils/ImageWithFallback";
import MonthlyUsageSummary from "../../components/Utils/MonthlyUsageSummary";
import { showConfirm } from "../../components/Utils/CustomConfirm";

const CartPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [cartExceedsLimit, setCartExceedsLimit] = useState(false);

  const {
    cart,
    subscription,
    updateCartItemWithValidation,
    deleteCartItemById,
    validateCartWithTier
  } = useCart();

  const { monthlyUsage, fetchMonthlyUsage } = useOrder();
  const { open: openOrderPanel } = useOrderPanel();

  useEffect(() => {
    fetchMonthlyUsage();
  }, [fetchMonthlyUsage]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (subscription?.tier && cart.length > 0) {
      const result = validateCartWithTier(cart, subscription.tier, monthlyUsage);
      setCartExceedsLimit(!result.valid);
    } else {
      setCartExceedsLimit(false);
    }
  }, [cart, subscription, monthlyUsage, validateCartWithTier]);

  const handleOrderClick = () => {
    if (isMobile) {
      navigate("/orders/new");
    } else {
      openOrderPanel();
    }
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItemWithValidation(id, newQuantity);
  };

  const handleDelete = (id) => {
    showConfirm({
      title: "장바구니 삭제",
      message: "정말 이 항목을 장바구니에서 삭제할까요?",
      onConfirm: async () => {
        await deleteCartItemById(id);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-10"
    >
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🛒 내 장바구니</h2>
          {cart.length > 0 && (
            <button
              className={`text-sm px-4 py-2 rounded transition text-white ${
                cartExceedsLimit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={!cartExceedsLimit ? handleOrderClick : undefined}
              disabled={cartExceedsLimit}
            >
              주문하기
            </button>
          )}
        </div>

        {cartExceedsLimit && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded mb-4 text-sm shadow">
            <strong className="text-yellow-800">
              ⚠️ 현재 장바구니의 상품이 구독 요금제의 한도를 초과하고 있어요.
            </strong>
            <p className="mt-1">수량을 줄이거나 불필요한 제품을 삭제해 주세요.</p>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-gray-500 text-center">
            장바구니에 담긴 상품이 없어요.
            <div className="mt-4">
              <Link
                to="/products"
                className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                제품 보러가기
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm"
              >
                <ImageWithFallback
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1 space-y-1">
                  <Link to={`/products/${item.product.id}`}>
                    <h4 className="font-semibold text-left text-green-700 hover:underline">
                      {item.product.name}
                    </h4>
                  </Link>

                  <p className="text-sm text-gray-500">
                    {item.product.size && `${item.product.size}`}
                    {item.product.shape && ` / ${item.product.shape}`}
                  </p>

                  {item.product.capacity &&
                    ["SAND", "BAG"].includes(item.product.type) && (
                      <p className="text-sm text-gray-500">
                        용량: {item.product.capacity}L
                      </p>
                    )}

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 text-sm ml-4 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {subscription?.tier && (
          <MonthlyUsageSummary
            usage={monthlyUsage}
            subscriptionTier={subscription.tier}
            cart={cart}
            title="📦 월간 사용량(장바구니 포함)"
          />
        )}
      </div>
    </motion.div>
  );
};

export default CartPage;