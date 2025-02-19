const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getProfileInfo, uploadProfilePhoto } = require('../controllers/profileController');

// 프로필 정보 확인
router.get('/info', authMiddleware, getProfileInfo);

// 프로필 사진 업로드
router.post('/upload-photo', authMiddleware, uploadProfilePhoto);

module.exports = router;