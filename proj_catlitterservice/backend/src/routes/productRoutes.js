import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getRecommendedProducts, getVariantsByProduct } from '../controllers/productController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔍 인기순 추천 상품
router.get('/recommended', getRecommendedProducts);

// 📦 상품 전체 조회 및 상세
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/variants', getVariantsByProduct);

// ➕ 상품 및 옵션 생성
router.post('/', isAdmin, createProduct);

// ✏️ 상품 수정 및 삭제
router.put('/:id', isAdmin, updateProduct);
router.delete('/:id', isAdmin, deleteProduct);

export default router;