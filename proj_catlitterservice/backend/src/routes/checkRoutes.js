import express from 'express';
import { checkUsername, checkEmail } from '../controllers/checkController.js';

const router = express.Router();

// 아이디 중복 확인
router.post('/username', checkUsername);

// 이메일 중복 확인
router.post('/email', checkEmail);

export default router;