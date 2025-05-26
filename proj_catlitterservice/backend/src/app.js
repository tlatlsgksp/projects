import express, { json } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from "node-cron";
import prisma from "./prisma/client.js";
import axios from "axios";
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import pickupRequestRoutes from './routes/pickupRequestRoutes.js';
import checkRoutes from './routes/checkRoutes.js'
import tiersRoutes from './routes/tiersRoutes.js';
import subscriptionsRoutes from './routes/subscriptionsRoutes.js'
import emailRoutes from "./routes/emailRoutes.js";
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const BASE_URL = "https://api.tosspayments.com/v1/payments/confirm";

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: "*", credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pickup-request', pickupRequestRoutes);
app.use('/api/check', checkRoutes);
app.use('/api/tiers', tiersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use("/api/email", emailRoutes);
app.use('/api/payments', paymentRoutes);

/*
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
    console.error("[Toss 결제 실패]", err.response?.data || err.message);
    return null;
  }
}

cron.schedule("0 0 * * *", async () => {
  const now = new Date(); // cron 함수 실행 시마다 fresh하게 날짜 설정
  console.log(`[CRON] 자정 구독 갱신 시작: ${now.toISOString()}`);

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

    // ⚠️ 실제 서비스에서는 Billing Key나 Webhook 기반으로 결제 승인 처리 필요
    const dummyPaymentKey = `pay_${Math.random().toString(36).slice(2)}`;

    const confirmed = await confirmPayment({
      paymentKey: dummyPaymentKey,
      orderId,
      amount: price,
    });

    if (confirmed) {
      if (sub.willCancel) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            isActive: false,
            willCancel: false,
            scheduledTierId: null,
          },
        });
        console.log(`[구독 만료 처리 완료] ${sub.user.name} (${sub.userId})`);
      } else {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            tierId: sub.scheduledTierId || sub.tierId,
            scheduledTierId: null,
            startDate: now,
            endDate: addOneMonth(now),
          },
        });
        console.log(`[자동 갱신 성공] ${sub.user.name} (${sub.userId})`);
      }
    } else {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          isActive: false,
          willCancel: false,
          scheduledTierId: null,
        },
      });
      console.log(`[결제 실패로 구독 해지됨] ${sub.user.name} (${sub.userId})`);
    }
  }
});*/

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});