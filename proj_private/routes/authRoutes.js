const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

// 회원가입
router.post('/register', authController.registerUser);

// 로그인
router.post('/login', authController.loginUser);

// 로그아웃
router.post('/logout', authController.logoutUser);

// 이메일 인증 코드 전송
router.post('/send-verification-code', authController.sendVerificationCode);

// 아이디 중복 확인
router.get('/check-id', authController.checkIdAvailability);

// 닉네임 중복 확인
router.get('/check-nickname', authController.checkNicknameAvailability);

// 비밀번호 재설정
router.post('/reset-password', authController.resetPassword);

// 비밀번호 업데이트
router.post('/update-password', authController.updatePassword);

// 보호된 페이지 (토큰 인증 필요)
router.get('/protected', authenticateToken, authController.protectedRoute);

module.exports = router;