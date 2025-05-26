import express from 'express';
import { getMyBilling, confirmPayment, confirmBilling } from '../controllers/paymentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();


// ✅ 내 billing 정보 조회
router.get('/billing/me', authenticateToken, getMyBilling);

// ✅ 카드 등록 후 billingKey 확정
router.post('/billing/confirm', authenticateToken, confirmBilling);

// ✅ 일반 결제 확인 (업그레이드 등)
router.post('/payments/confirm', authenticateToken, confirmPayment);

export default router;