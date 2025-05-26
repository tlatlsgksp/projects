import express from 'express';
import { getMySubscription, createSubscription, cancelSubscription, downgradeSubscription, cancelDowngrade, revertCancelSubscription } from '../controllers/subscriptionController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ 내 구독 조회
router.get('/me', authenticateToken, getMySubscription);

// ✅ 구독 생성 (실제 사용은 orderController에서 내부 호출함)
router.post('/', authenticateToken, async (req, res) => {
  const { tierId } = req.body;
  const userId = req.user.userId;

  try {
    const subscription = await createSubscription(userId, tierId);
    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ error: "구독 생성 실패" });
  }
});

// ✅ 구독 취소 (PATCH /subscriptions/:id/cancel)
router.patch('/:id/cancel', authenticateToken, cancelSubscription);

// ✅ 구독 다운그레이드 예약
router.post('/downgrade', authenticateToken, downgradeSubscription);

// 구독 다운그레이드 취소
router.post('/downgrade/cancel', authenticateToken, cancelDowngrade);

// 구독 취소 철회
router.post('/revert-cancel', authenticateToken, revertCancelSubscription);

export default router;