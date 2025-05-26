import express from 'express';
import { getUserInfo, getMySubscription, getMyFavorites, updateMyProfile, changePassword, toggleFavorite } from '../controllers/userController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticateToken, getUserInfo);
router.patch("/me", authenticateToken, updateMyProfile);
router.get('/me/subscription', authenticateToken, getMySubscription);
router.get("/me/favorites", authenticateToken, getMyFavorites);
router.post('/me/favorites/:productId', authenticateToken, toggleFavorite);
router.patch('/me/password', authenticateToken, changePassword);

export default router;