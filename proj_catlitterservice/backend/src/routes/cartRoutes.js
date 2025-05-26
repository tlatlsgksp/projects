import express from 'express';
import { getMyCart, addCartItem, updateCartItem, deleteCartItem } from '../controllers/cartController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticateToken, getMyCart);
router.post('/', authenticateToken, addCartItem);
router.put('/:id', authenticateToken, updateCartItem);
router.delete('/:id', authenticateToken, deleteCartItem);

export default router;