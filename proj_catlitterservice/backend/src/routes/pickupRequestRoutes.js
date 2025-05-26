import express from 'express';
import { createPickupRequest } from '../controllers/pickupRequestController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 수거 요청 생성 (RESTful 구조로 orders/:orderId/pickup)
router.post('/orders/:orderId/pickup', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { note, inHouse } = req.body;
  await createPickupRequest({
    ...req,
    body: { ...req.body, orderId: Number(orderId), note, inHouse },
  }, res);
});

export default router;
