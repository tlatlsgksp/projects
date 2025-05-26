import prisma from "../src/prisma/client.js";
import axios from "axios";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const BASE_URL = "https://api.tosspayments.com/v1/payments/confirm";

const now = new Date();

function addOneMonth(date) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  return result;
}

async function confirmPayment({ paymentKey, orderId, amount }) {
  try {
    const res = await axios.post(
      BASE_URL,
      { paymentKey, orderId, amount },
      {
        auth: { username: TOSS_SECRET_KEY, password: "" },
        headers: { "Content-Type": "application/json" },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Toss 결제 실패:", err.response?.data || err.message);
    return null;
  }
}

async function runRenewal() {
  const expiredSubs = await prisma.subscription.findMany({
    where: {
      isActive: true,
      endDate: { lte: now },
    },
    include: {
      user: true,
      tier: true,
    },
  });

  for (const sub of expiredSubs) {
    const price = sub.tier.price;
    const orderId = `renewal_${sub.id}_${Date.now()}`;

    const dummyPaymentKey = `pay_${Math.random().toString(36).slice(2)}`; // 실 서비스에선 Webhook이나 저장된 키 사용

    const confirmed = await confirmPayment({
      paymentKey: dummyPaymentKey, // 실제 결제와 연동 시 수정 필요
      orderId,
      amount: price,
    });

    if (confirmed) {
      if (sub.willCancel) {
        // 해지 예정 → 이번으로 마지막 → 종료 처리
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            isActive: false,
            willCancel: false,
            scheduledTierId: null,
          },
        });
        console.log(`[CANCELLED AFTER LAST PERIOD] ${sub.user.name} (${sub.userId})`);
      } else {
        // 일반 갱신 or 요금제 변경
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            tierId: sub.scheduledTierId || sub.tierId,
            scheduledTierId: null,
            startDate: now,
            endDate: addOneMonth(now),
          },
        });
        console.log(`[RENEWED] ${sub.user.name} (${sub.userId})`);
      }
    } else {
      // 결제 실패 → 즉시 해지
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          isActive: false,
          willCancel: false,
          scheduledTierId: null,
        },
      });
      console.log(`[CANCELLED DUE TO PAYMENT FAILURE] ${sub.user.name} (${sub.userId})`);
    }
  }
}

runRenewal().then(() => {
  console.log("✅ 구독 갱신 처리 완료");
  process.exit();
});
