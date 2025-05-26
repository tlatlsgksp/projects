import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import toast from "react-hot-toast";

// ✅ Context
import { useAuth } from "../context/AuthContext";
import { useTier } from "../context/TierContext";
import { useSubscription } from "../context/SubscriptionContext";
import { usePayment } from "../context/PaymentContext";

// ✅ Components
import SubscriptionTierCard from "../components/SubscriptionTierCard";
import SubscriptionGuide from "../components/SubscriptionGuide";
import { showConfirm } from "../components/CustomConfirm";
import Warning from "../components/Warning";

const SubscriptionsSignPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { tiers, fetchTiers } = useTier();
  const {
    subscription,
    fetchSubscription,
    requestCancel,
    requestRevertCancel,
    requestDowngrade,
    requestCancelDowngrade,
  } = useSubscription();
  const {
    billingInfo,
    fetchBillingInfo,
  } = usePayment();

  const [showGuide, setShowGuide] = useState(false);
  const [hasSubscribedOnce, setHasSubscribedOnce] = useState(false);

  const hasBillingKey = !!billingInfo?.billingKey;
  const billingCustomerKey = billingInfo?.customerKey;

  useEffect(() => {
    fetchTiers();

    fetchSubscription()
      .then(() => setHasSubscribedOnce(true))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setHasSubscribedOnce(false);
        } else {
          console.error("구독 정보 로드 실패:", err);
        }
      });

    fetchBillingInfo();
  }, [fetchTiers, fetchSubscription, fetchBillingInfo]);

  const handleSubscribe = (tierId) => {
    const selectedTier = tiers.find((t) => t.id === tierId);
    const customerName = user?.name || "회원";

    if (!hasSubscribedOnce) {
      return showConfirm({
        title: "🚫 서비스 제한 안내",
        message: (
          <div className="text-red-600 font-medium space-y-2 leading-relaxed">
            <p>⚠️ <strong>도서산간 지역</strong>에서는 해당 서비스를 이용하실 수 없어요.</p>
            <p>그래도 <span className="underline">결제를 진행</span>하시겠어요?</p>
          </div>
        ),
        onConfirm: () => proceedWithSubscription(tierId, selectedTier, customerName),
      });
    }

    proceedWithSubscription(tierId, selectedTier, customerName);
  };

  const proceedWithSubscription = (tierId, selectedTier, customerName) => {
    if (!hasBillingKey) return registerBillingCard(tierId);

    if (!subscription) {
      toast.success(`₩${selectedTier.price.toLocaleString()} 결제가 등록된 카드로 진행돼요`);
      return;
    }

    if (subscription.willCancel) {
      return toast.error("이미 구독 취소를 예약하셨어요. 철회 후 변경해주세요.");
    }

    if (subscription.scheduledTierId) {
      return toast.error("이미 변경 예약된 요금제가 있어요. 먼저 취소해주세요.");
    }

    const currentTier = tiers.find((t) => t.id === subscription?.tierId);

    if (selectedTier.id === subscription.tierId) {
      return toast.error("이미 사용 중인 요금제예요.");
    }

    if (selectedTier.price > currentTier.price) {
      const diff = selectedTier.price - currentTier.price;
      const upgradeAmount = diff + (!hasSubscribedOnce && selectedTier.depositRequired ? selectedTier.depositAmount || 0 : 0);
      return proceedToUpgradePayment(upgradeAmount, `${selectedTier.name} 업그레이드`, customerName, selectedTier.id);
    }

    if (selectedTier.price < currentTier.price) {
      return showConfirm({
        title: "🔻 요금제 변경 안내",
        message: (
          <div className="space-y-2 text-gray-800 leading-relaxed">
            <p>📅 다음 결제일부터 <strong>{selectedTier.name}</strong> 요금제가 적용돼요.</p>
            <p>변경 예약을 진행할까요?</p>
          </div>
        ),
        onConfirm: () => {
          requestDowngrade({ tierId: selectedTier.id })
            .then(() => {
              toast.success("요금제 변경이 예약됐어요!");
              fetchSubscription();
            })
            .catch(() => toast.error("변경 예약 실패"));
        },
      });
    }

    // ❗ 동일 가격일 때는 명확히 예외 처리
    return toast.error("같은 가격의 요금제로는 변경할 수 없어요.");
  };

  const registerBillingCard = async (tierId) => {
    if (!billingCustomerKey) {
      toast.error("고객 키 정보를 불러오지 못했어요.");
      return;
    }

    try {
      const tossPayments = await loadTossPayments(process.env.REACT_APP_TOSS_CLIENT_KEY);
      await tossPayments.requestBillingAuth("카드", {
        customerKey: billingCustomerKey,
        successUrl: `${window.location.origin}/payment/billing/success?tierId=${tierId}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      console.error("카드 등록 실패:", err);
    }
  };

  const proceedToUpgradePayment = async (amount, orderName, customerName, tierId) => {
    const orderId = btoa(Date.now() + Math.random());
    try {
      const tossPayments = await loadTossPayments(process.env.REACT_APP_TOSS_CLIENT_KEY);
      await tossPayments.requestPayment("카드", {
        amount,
        currency: "KRW",
        orderId,
        orderName,
        customerName,
        successUrl: `${window.location.origin}/payment/success?tierId=${tierId}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      console.error("업그레이드 결제 오류:", err);
    }
  };

  const handleCancel = () => {
    showConfirm({
      title: "❌ 구독 취소 안내",
      message: (
        <div className="space-y-2 text-gray-800 leading-relaxed">
          <p>정말로 구독을 <strong className="text-red-600">취소</strong>하시겠어요?</p>
          <p className="text-sm">예약된 요금제 변경도 함께 취소돼요.</p>
        </div>
      ),
      onConfirm: async () => {
        try {
          if (subscription.scheduledTierId) {
            await requestCancelDowngrade();
          }
          await requestCancel(subscription.id);
          toast.success("구독 취소가 예약되었어요.");
          fetchSubscription();
        } catch {
          toast.error("구독 취소 실패");
        }
      },
    });
  };

  const handleRevertCancel = () => {
    showConfirm({
      title: "🔁 구독 유지 안내",
      message: (
        <div className="space-y-2 text-gray-800 leading-relaxed">
          <p>구독 취소를 <strong className="text-blue-600">철회</strong>하고 자동 결제를 유지할까요?</p>
          <p className="text-sm text-gray-600">다음 결제일부터 다시 결제가 진행돼요.</p>
        </div>
      ),
      onConfirm: () => {
        requestRevertCancel()
          .then(() => {
            toast.success("구독이 유지돼요!");
            fetchSubscription();
          })
          .catch(() => toast.error("철회 실패"));
      },
    });
  };

  const handleCancelDowngrade = () => {
    showConfirm({
      title: "🗓️ 예약 취소 안내",
      message: (
        <div className="space-y-2 text-gray-800 leading-relaxed">
          <p>변경 예약을 <strong className="text-gray-700">정말로 취소</strong>할까요?</p>
        </div>
      ),
      onConfirm: async () => {
        try {
          await requestCancelDowngrade();
          toast.success("변경 예약이 취소됐어요.");
          fetchSubscription();
        } catch {
          toast.error("예약 취소 실패");
        }
      },
    });
  };

  const isTierDisabled = (tier) =>
    subscription &&
    (subscription.tierId === tier.id || subscription.scheduledTierId === tier.id || subscription.willCancel);

  const getButtonLabel = (tier) => {
    if (!subscription) return "카드 등록 후 구독하기";
    if (subscription.tierId === tier.id) return "현재 구독중";
    if (subscription.scheduledTierId === tier.id) return "변경 예약됨";
    if (subscription.willCancel) return "구독 취소 대기중";
    return "결제 후 구독하기";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Warning />
        <div className="bg-white border rounded-xl p-6 mb-10 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">💳 멤버십 관리</h2>
            <button
              onClick={() => setShowGuide((prev) => !prev)}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              ❓ 요금제 사용 가이드
            </button>
          </div>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <SubscriptionGuide />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <SubscriptionTierCard
              key={tier.id}
              tier={tier}
              isCurrent={subscription?.tierId === tier.id}
              showButton={true}
              disabled={isTierDisabled(tier)}
              buttonLabel={getButtonLabel(tier)}
              onClick={() => handleSubscribe(tier.id)}
            />
          ))}
        </div>

        {isAuthenticated && subscription?.tierId && (
          <div className="mt-20 mb-16">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white border rounded-2xl shadow-sm p-5">
                <h3 className="text-gray-700 font-semibold mb-3">📌 구독 상태</h3>
                {subscription.willCancel ? (
                  <>
                    <p className="text-sm text-red-500 mb-4">다음 결제일 이후 구독이 종료돼요</p>
                    <button
                      onClick={handleRevertCancel}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-medium"
                    >
                      구독 취소 철회하기
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">계속해서 자동 결제가 진행돼요</p>
                    <button
                      onClick={handleCancel}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium"
                    >
                      구독 취소하기
                    </button>
                  </>
                )}
              </div>

              <div className="bg-white border rounded-2xl shadow-sm p-5">
                <h3 className="text-gray-700 font-semibold mb-3">🔄 요금제 변경 예약</h3>
                {subscription.scheduledTierId ? (
                  <>
                    <p className="text-sm text-orange-500 mb-4">
                      다음 결제일부터 <strong>{tiers.find((t) => t.id === subscription.scheduledTierId)?.name}</strong> 요금제가 적용돼요
                    </p>
                    <button
                      onClick={handleCancelDowngrade}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md font-medium"
                    >
                      변경 예약 취소하기
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">예약된 변경이 없어요</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionsSignPage;