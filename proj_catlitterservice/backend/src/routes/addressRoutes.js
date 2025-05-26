import express from 'express';
import { getAllAddresses, getMyAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', isAdmin, getAllAddresses);
router.get('/me', authenticateToken, getMyAddresses);
router.post('/', authenticateToken, addAddress);
router.put('/:id', authenticateToken, updateAddress);
router.delete('/:id', authenticateToken, deleteAddress);
router.patch('/:id/default', authenticateToken, setDefaultAddress);


export default router;