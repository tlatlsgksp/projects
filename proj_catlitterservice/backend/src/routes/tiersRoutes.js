import express from 'express';
import { getAllTiers, createTier, updateTier, deleteTier } from '../controllers/tierController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 📦 구독 요금제 목록 조회
router.get('/', getAllTiers);

// ➕ 요금제 생성 (관리자용 API로 권한 체크 필요 시 추후 middleware 추가 가능)
router.post('/', isAdmin, createTier);

// ✏️ 요금제 수정
router.patch('/:id', isAdmin, updateTier);

// ❌ 요금제 삭제
router.delete('/:id', isAdmin, deleteTier);

export default router;