import prisma from '../prisma/client.js';
import axios from 'axios';
import { createSubscription } from './subscriptionController.js';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

// ✅ 내 billing 정보 조회
export const getMyBilling = async (req, res) => {
  const userId = req.user.userId;

  try {
    const billing = await prisma.billingInfo.findUnique({ where: { userId } });

    if (!billing) {
      return res.status(404).json({ message: "Billing 정보가 없어요." });
    }

    res.json({
      customerKey: billing.customerKey,
      createdAt: billing.createdAt,
      updatedAt: billing.updatedAt,
    });
  } catch (err) {
    console.error("Billing 정보 조회 실패:", err);
    res.status(500).json({ message: "서버 오류로 Billing 정보를 불러오지 못했어요." });
  }
};

// ✅ 카드 등록 후 billingKey 확정
export const confirmBilling = async (req, res) => {
  const { authKey, tierId } = req.body;
  const userId = req.user.userId;

  try {
    const billingInfo = await prisma.billingInfo.findUnique({ where: { userId } });
    if (!billingInfo) return res.status(404).json({ message: "Billing 정보가 없어요." });

    const customerKey = billingInfo.customerKey;

    const { data } = await axios.post(
      'https://api.tosspayments.com/v1/billing/authorizations/confirm',
      { authKey, customerKey },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { billingKey } = data;

    await prisma.billingInfo.update({
      where: { userId },
      data: { billingKey },
    });

    const existing = await prisma.subscription.findFirst({ where: { userId } });
    let subscription = null;

    if (!existing) {
      subscription = await createSubscription(userId, tierId);
    }

    res.json({ success: true, billingKey, customerKey, subscription });
  } catch (err) {
    console.error('BillingKey 등록 실패:', err.response?.data || err.message);
    res.status(500).json({ message: '결제 확인 또는 구독 생성에 실패했어요.' });
  }
};

// ✅ 일반 결제 확인 (업그레이드 등)
export const confirmPayment = async (req, res) => {
  const { paymentKey, orderId, amount, tierId } = req.body;
  const userId = req.user.userId;

  try {
    await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const subscription = await createSubscription(userId, tierId);

    res.json({ success: true, subscription });
  } catch (err) {
    console.error("결제 확인 실패:", err);
    res.status(500).json({ message: "결제 확인 또는 구독 생성에 실패했어요." });
  }
};