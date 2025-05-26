import React from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Toaster } from 'react-hot-toast';
import { useLocation, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import PrivateRoute from './components/PrivateRoute';

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

import Header from './components/Header';
import Footer from './components/Footer';
import CursorTrail from "./components/CursorTrail";
import BottomBar from './components/BottomBar';

import HomePage from './pages/Home';
import AboutPage from './pages/About';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

import ProductPage from './pages/Products';
import ProductsDetailPage from './pages/ProductsDetail';
import FavoriteProductsPage from './pages/FavoriteProducts';

import CartPage from "./pages/Cart";

import MyPage from './pages/MyPage';

import ProfilePage from "./pages/Profile";
import ProfileEditPage from './pages/ProfileEdit';

import AddressPage from './pages/Address';
import AddressNewPage from "./pages/AddressNew";
import AddressEditPage from "./pages/AddressEdit";

import SubscriptionsSignPage from './pages/SubscriptionsSign';
import SubscriptionsInfoPage from './pages/SubscriptionsInfo';

import OrdersPage from './pages/Orders'
import OrdersNewPage from './pages/OrdersNew'
import OrdersDetailPage from './pages/OrdersDetail';

import PaymentBillingSuccessPage from "./pages/PaymentBillingSuccess";
import PaymentSuccessPage from "./pages/PaymentSuccess";
import PaymentFailPage from "./pages/PaymentFail";

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
                                      <Route path="/cart" element={<CartPage />} />

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
                                      <Route path="/orders/new" element={<OrdersNewPage />} />
                                      <Route path="/orders/:id" element={<OrdersDetailPage />} />

                                      

                                      <Route path="/payment/billing/success" element={<PaymentBillingSuccessPage />} />
                                      <Route path="/payment/success" element={<PaymentSuccessPage />} />
                                      <Route path="/payment/fail" element={<PaymentFailPage />} />
                                      
                                      
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
            </FavoriteProvider>
          </ProductProvider>
        </AddressProvider>
    </AuthProvider>
  );
}

export default AppLayout;