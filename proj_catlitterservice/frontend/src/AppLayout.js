import React from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Toaster } from 'react-hot-toast';
import { useLocation, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";

import { OrderPanelProvider } from './context/OrderPanelContext';
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AddressProvider } from "./context/AddressContext";
import { ProductProvider } from "./context/ProductContext";
import { FavoriteProvider } from "./context/FavoriteContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { TierProvider } from "./context/TierContext";
import { OrderProvider } from "./context/OrderContext";
import { PaymentProvider } from "./context/PaymentContext";
import { ReviewProvider } from "./context/ReviewContext";

import Header from './components/Utils/Header';
import Footer from './components/Utils/Footer';
import CursorTrail from "./components/Utils/CursorTrail";
import BottomBar from './components/Utils/BottomBar';
import PrivateRoute from './components/Utils/PrivateRoute';
import SubscriptionsRoute from './components/Utils/SubscriptionsRoute';

import HomePage from './pages/Main/Home';
import AboutPage from './pages/Main/About';

import LoginPage from './pages/Sign/Login';
import RegisterPage from './pages/Sign/Register';

import ProductPage from './pages/Products/Products';
import ProductsDetailPage from './pages/Products/ProductsDetail';
import FavoriteProductsPage from './pages/Products/FavoriteProducts';
import CartPage from "./pages/Products/Cart";

import MyPage from './pages/Mypages/MyPage';
import ProfilePage from "./pages/Mypages/Profile";
import ProfileEditPage from './pages/Mypages/ProfileEdit';

import AddressPage from './pages/Addresses/Address';
import AddressNewPage from "./pages/Addresses/AddressNew";
import AddressEditPage from "./pages/Addresses/AddressEdit";

import SubscriptionsSignPage from './pages/Subscriptions/SubscriptionsSign';
import SubscriptionsInfoPage from './pages/Subscriptions/SubscriptionsInfo';

import OrdersPage from './pages/Orders/Orders'
import OrdersNewPage from './pages/Orders/OrdersNew'
import OrdersDetailPage from './pages/Orders/OrdersDetail';

import PaymentBillingSuccessPage from "./pages/Payments/PaymentBillingSuccess";
import PaymentSuccessPage from "./pages/Payments/PaymentSuccess";
import PaymentFailPage from "./pages/Payments/PaymentFail";

function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  const hiddenPaths = ['/login', '/register', '/payment/success', '/payment/fail', '/admin'];
  const shouldHide = hiddenPaths.includes(path);
  const isProductDetailPage = /^\/products\/\d+$/.test(path);
  const productId = isProductDetailPage ? parseInt(path.split('/')[2]) : null;

  return (
    <AuthProvider>
        <AddressProvider>
          <ProductProvider>
            <FavoriteProvider>
              <ReviewProvider>
                <SubscriptionProvider>
                  <TierProvider>
                    <OrderProvider>
                      <CartProvider>
                        <PaymentProvider>
                          <OrderPanelProvider>
                            <AnimatePresence>
                              <div key={location.pathname}>
                                <Toaster position="top-center" />
                                <CursorTrail />
                                <div className="font-sans bg-gray-50 min-h-screen">
                                  {/* Header */}
                                  <Header />

                                  {/* Route */}
                                  <main className="max-w-7xl mx-auto px-4 py-6">
                                    <Routes location={location}>
                                      <Route path="/" element={<HomePage />} />
                                      <Route path="/about" element={<AboutPage />} />
                                      <Route path="/login" element={<LoginPage />} />
                                      <Route path="/register" element={<RegisterPage />} />
                                      <Route path="/products" element={<ProductPage />} />
                                      <Route path="/products/:id" element={<ProductsDetailPage />} />

                                      <Route element={<PrivateRoute />}>
                                        <Route path="/mypage" element={<MyPage />} />
                                        <Route path="/mypage/profile" element={<ProfilePage />} />
                                        <Route path="/mypage/profile/edit" element={<ProfileEditPage />} />
                                        <Route path="/mypage/addresses" element={<AddressPage />} />
                                        <Route path="/mypage/addresses/new" element={<AddressNewPage />} />
                                        <Route path="/mypage/addresses/:id/edit" element={<AddressEditPage />} />
                                        <Route path="/mypage/favorites" element={<FavoriteProductsPage />} />
                                        
                                        <Route path="/mypage/subscriptionsinfo" element={<SubscriptionsInfoPage />} />
                                        <Route path="/subscriptionssign" element={<SubscriptionsSignPage />} />
                                        
                                        <Route path="/mypage/orders" element={<OrdersPage />} />
                                        <Route path="/orders/:id" element={<OrdersDetailPage />} />

                                        <Route path="/payment/fail" element={<PaymentFailPage />} />

                                        <Route element={<SubscriptionsRoute />}>
                                          <Route path="/cart" element={<CartPage />} />
                                          <Route path="/orders/new" element={<OrdersNewPage />} />
                                          <Route path="/payment/billing/success" element={<PaymentBillingSuccessPage />} />
                                          <Route path="/payment/success" element={<PaymentSuccessPage />} />
                                        </Route>
                                      </Route>
                                    </Routes>
                                  </main>

                                  {/* Footer */}
                                  <Footer />
                                </div>

                                {!shouldHide && (
                                  <BottomBar
                                    showApply={!isProductDetailPage}
                                    showFavorite={isProductDetailPage}
                                    showAddToCart={isProductDetailPage}
                                    productId={productId}
                                  />
                                )}
                              </div>
                            </AnimatePresence>
                          </OrderPanelProvider>
                        </PaymentProvider>
                      </CartProvider>
                    </OrderProvider>
                  </TierProvider>
                </SubscriptionProvider>
              </ReviewProvider>
            </FavoriteProvider>
          </ProductProvider>
        </AddressProvider>
    </AuthProvider>
  );
}

export default AppLayout;