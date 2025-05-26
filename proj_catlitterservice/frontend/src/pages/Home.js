import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// ✅ Context
import { useProduct } from "../context/ProductContext";
import { useTier } from "../context/TierContext";

// ✅ Components
import FlowSlider from "../components/FlowSlider";
import SubscriptionTierCard from "../components/SubscriptionTierCard";
import SubscriptionGuide from "../components/SubscriptionGuide";
import Warning from "../components/Warning";

function HomePage() {
  const { recommended, fetchRecommended } = useProduct();
  const { tiers, fetchTiers } = useTier();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchRecommended();
    fetchTiers();
  }, [fetchRecommended, fetchTiers]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-7xl mx-auto px-4">
        <Warning />
        {/* 서비스 소개 */}
        <section className="text-center mb-20">
          <h1 className="text-4xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent mb-3">
            고양이 화장실 렌탈 & 수거 서비스
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
            위생적인 고양이 라이프를 위한 <strong className="text-green-600">스마트 관리</strong>
            <br />
            <span className="text-blue-500 font-medium">
              청소 걱정 끝! 화장실은 저희가 책임질게요 😸
            </span>
          </p>

          <div className="text-center bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10 max-w-2xl mx-auto text-left">
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-4">
              <span className="text-green-500 font-bold">🐱 고양이 화장실 관리</span>에 어려움을 겪고 계신가요?
              <br />
              <span className="text-orange-500 font-semibold">똥냥이</span>는 <strong className="text-green-600">렌탈부터 수거까지</strong> 맞춤형 서비스를 제공해요.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
              <li className="leading-snug">✅ 다양한 제품군을 취향에 맞게, 자유롭고 손 쉽게!</li>
              <li className="leading-snug">✅ 한도 내에 자유롭게, 가격 부담 없는 구독제 서비스!</li>
              <li className="leading-snug">✅ 더러워진 화장실이나 모래, 원하는 날짜에 교체 및 수거!</li>
            </ul>
            <p className="mt-6 text-center font-medium text-blue-600">
              ✨ 지금 바로 <span className="font-bold text-orange-500">똥냥이</span>와 함께 새로운 고양이 라이프를 시작하세요!
            </p>
          </div>

          <button
            onClick={() => setShowGuide(prev => !prev)}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mx-auto mb-6"
          >
            ❓ 요금제 사용 가이드 보기
          </button>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-12"
              >
                <SubscriptionGuide />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {tiers.map((tier) => (
              <SubscriptionTierCard key={tier.id} tier={tier} showButton={false} />
            ))}
          </div>

          <Link to="/subscriptionssign">
            <button className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-md text-sm sm:text-base shadow-md font-medium">
              요금제 구독 시작하기
            </button>
          </Link>
        </section>

        {/* 추천 제품 섹션 */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
            <span className="text-pink-500 text-2xl">🔥</span> 인기 제품 추천
          </h2>

          {recommended.length === 0 ? (
            <p className="text-gray-400 text-center py-10">😿 추천할 제품이 아직 없어요</p>
          ) : (
            <FlowSlider products={recommended} />
          )}

          <div className="text-center mt-14">
            <Link to="/products">
              <button className="bg-green-400 hover:bg-green-500 text-white text-sm sm:text-base px-6 py-2 rounded-md shadow-md font-medium flex items-center gap-2 mx-auto transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" />
                </svg>
                제품 모아보기
              </button>
            </Link>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

export default HomePage;