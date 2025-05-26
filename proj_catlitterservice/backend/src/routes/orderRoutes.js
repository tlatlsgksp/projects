import express from 'express';
import { getOrderById, createOrder, cancelOrder, getMyOrders, getAllOrders, getMonthlyUsage  } from '../controllers/orderController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 어드민용
router.get('/admin/all', isAdmin, getAllOrders);

// ✅ 월간 사용량 계산
router.get('/monthly-usage', authenticateToken, getMonthlyUsage);

// ✅ 주문 생성, 취소, 조회
router.post('/', authenticateToken, createOrder);
router.patch('/:orderId/cancel', authenticateToken, cancelOrder);
router.get('/me', authenticateToken, getMyOrders);
router.get('/:id', authenticateToken, getOrderById);



export default router;