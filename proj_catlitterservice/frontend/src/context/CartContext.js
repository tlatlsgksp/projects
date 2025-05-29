import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getMyCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
} from '../api/cart';
import { getMySubscription } from '../api/subscription';
import { useAuth } from './AuthContext';
import { useOrder } from "./OrderContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const { isAuthenticated } = useAuth();
  const { monthlyUsage } = useOrder();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMyCart();
      const list = Array.isArray(res.data) ? res.data : [];
      setCart(list);
      setCartCount(list.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCart([]);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMySubscription();
      setSubscription(res.data);
    } catch {
      setSubscription(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
    refreshSubscription();
  }, [refreshCart, refreshSubscription]);

  const addToCartWithValidation = useCallback(async (product) => {
    if (!isAuthenticated || !product?.id) return;

    try {
      const res = await getMyCart();
      const currentCart = Array.isArray(res.data) ? res.data : [];

      const updatedCart = [...currentCart];
      const existingItem = updatedCart.find(item => item.product.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        updatedCart.push({ product, quantity: 1 });
      }

      const result = validateCartWithTier(updatedCart, subscription?.tier, monthlyUsage);
      if (!result.valid) {
        toast.error(result.message);
        return false;
      }

      await addCartItem(product.id, 1);
      toast.success("장바구니에 추가했어요!");
      await refreshCart();
      return true;
    } catch {
      toast.error("장바구니 추가에 실패했어요.");
      return false;
    }
  }, [isAuthenticated, subscription, refreshCart, monthlyUsage]);

  const updateCartItemWithValidation = useCallback(async (cartItemId, newQuantity) => {
    if (!isAuthenticated || !cartItemId || newQuantity < 1) return;

    try {
      const res = await getMyCart();
      const currentCart = Array.isArray(res.data) ? res.data : [];

      const targetItem = currentCart.find(item => item.id === cartItemId);
      const isReducing = targetItem && newQuantity < targetItem.quantity;

      const updatedCart = currentCart.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );

      if (!isReducing) {
        const result = validateCartWithTier(updatedCart, subscription?.tier, monthlyUsage);
        if (!result.valid) {
          toast.error(result.message);
          return false;
        }
      }

      await updateCartItem(cartItemId, newQuantity);
      toast.success("수량이 변경됐어요.");
      await refreshCart();
      return true;
    } catch {
      toast.error("수량 변경에 실패했어요.");
      return false;
    }
  }, [isAuthenticated, subscription, refreshCart, monthlyUsage]);

  const deleteCartItemById = useCallback(async (cartItemId) => {
    if (!isAuthenticated || !cartItemId) return;
    try {
      await deleteCartItem(cartItemId);
      toast.success("품목을 삭제했어요.");
      await refreshCart();
    } catch {
      toast.error("품목 삭제에 실패했어요.");
    }
  }, [isAuthenticated, refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subscription,
        refreshCart,
        refreshSubscription,
        addToCartWithValidation,
        updateCartItemWithValidation,
        deleteCartItemById,
        validateCartWithTier,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

// ✅ 장바구니 검증 함수
const validateCartWithTier = (cart, tier, monthlyUsage = null) => {
  if (!tier) return { valid: true };
  
  let litterboxCount = 0;
  let sandLitre = 0;
  let bagLitre = 0;
  let scoopCount = 0;

  cart.forEach(item => {
    const { type, capacity } = item.product;
    const { quantity } = item;

    switch (type) {
      case "LITTERBOX":
        litterboxCount += quantity;
        break;
      case "SAND":
        sandLitre += (capacity || 0) * quantity;
        break;
      case "BAG":
        bagLitre += (capacity || 0) * quantity;
        break;
      case "SCOOP":
        scoopCount += quantity;
        break;
      default:
    }
  });
  if (monthlyUsage) {
    litterboxCount += monthlyUsage.totalLitterboxes || 0;
    sandLitre += monthlyUsage.totalSand || 0;
    bagLitre += monthlyUsage.totalBag || 0;
    scoopCount += monthlyUsage.totalScoops || 0;
  }
  // 3. 티어 한도와 비교
  if (litterboxCount > tier.maxLitterboxesPerOrder)
    return { valid: false, message: `화장실은 최대 ${tier.maxLitterboxesPerOrder}개까지 담을 수 있어요.` };
  if (sandLitre > tier.monthlySandLimitLitre)
    return { valid: false, message: `모래는 총 ${tier.monthlySandLimitLitre}L까지 담을 수 있어요.` };
  if (bagLitre > tier.monthlyBagLimitLitre)
    return { valid: false, message: `봉투는 총 ${tier.monthlyBagLimitLitre}L까지 담을 수 있어요.` };
  if (scoopCount > tier.maxScoopsPerOrder)
    return { valid: false, message: `삽은 최대 ${tier.maxScoopsPerOrder}개까지 담을 수 있어요.` };

  return { valid: true };
};