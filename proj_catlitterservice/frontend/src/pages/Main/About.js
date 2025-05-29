import React from 'react';
import { motion } from 'framer-motion';
import { ListChecks, ShoppingBag, Truck, Repeat2 } from 'lucide-react';
import Warning from "../../components/Utils/Warning";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 }
  })
};

const icons = [
  <ListChecks className="w-10 h-10 text-green-500 mb-2" />,
  <ShoppingBag className="w-10 h-10 text-indigo-500 mb-2" />,
  <Truck className="w-10 h-10 text-orange-500 mb-2" />,
  <Repeat2 className="w-10 h-10 text-blue-500 mb-2" />
];

const AboutPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-16 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4">
        <Warning />
        <div className="bg-white border rounded-2xl p-8 mb-16 shadow-md text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">✨ <span className="text-orange-500">똥냥이</span>는 이렇게 작동해요</h2>
          <p className="text-gray-600 text-base sm:text-lg">
            <span className="font-semibold text-orange-500">똥냥이</span>는 단순한 렌탈이 아니에요.<br />
            <strong className="text-green-600">고양이 화장실을 구독하고, 정기적으로 수거·교체하는 똑똑한 순환 시스템</strong>이에요.<br />
            매월 새로운 시작, 위생적인 고양이 라이프를 경험해보세요.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: '요금제 선택',
              description: (
                <>
                  고양이 수, 화장실 개수, 사용량을 고려해 가장 알맞은 요금제를 구독하세요.<br />
                  가격도 구성도 다양한 플랜을 제공합니다.<br />
                  첫 이용자는 할인 또는 보증금 면제 혜택도 있어요!
                </>
              )
            },
            {
              title: '제품 주문',
              description: (
                <>
                  구독한 요금제 내에서 자유롭게 제품을 골라요.<br />
                  모래, 봉투, 화장실, 삽까지 원하는 스타일로!<br />
                  찜한 제품은 주문 시 바로 선택 가능해요.<br />
                </>
              )
            },
            {
              title: '수거 요청',
              description: (
                <>
                  화장실이나 모래가 더러워졌다면 수거를 신청하세요.<br />
                  기사님이 방문하여 수거하고 깨끗한 제품으로 교체해드려요.<br />
                  수거 메모도 남길 수 있어요.<br />
                </>
              )
            },
            {
              title: '자동 갱신 & 변경',
              description: (
                <>
                  구독은 매월 자동 결제되며 편리하게 지속돼요.<br />
                  요금제 변경, 해지까지 클릭 한 번이면 끝!<br />
                  모든 내역은 마이페이지에서 확인할 수 있어요.
                </>
              )
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col items-center text-center h-full"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardVariants}
            >
              {icons[i]}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;
