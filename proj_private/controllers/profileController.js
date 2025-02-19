const path = require('path');
const db = require('../config/dbconfig');
const multer = require('multer');

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일명은 고유하게 설정
    }
});
const upload = multer({ storage: storage });

// 프로필 정보 확인
exports.getProfileInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = 'SELECT id, email, created_at FROM users WHERE id = ?';
        
        db.get(query, [userId], (err, user) => {
            if (err) {
                console.error("쿼리 실행 오류:", err);
                return res.status(500).json({ message: '서버 오류' });
            }
            if (!user) {
                console.log("사용자 정보를 찾을 수 없음");
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }
            res.json(user);
        });
    } catch (error) {
        console.error("서버 오류:", error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 프로필 사진 업로드 API
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const photoUrl = `/uploads/${req.file.filename}`;
        const userId = req.user.id;
        
        // 사용자 정보에 프로필 사진 URL을 업데이트
        await db.run('UPDATE users SET photo = ? WHERE id = ?', [photoUrl, userId]);

        res.json({ message: '프로필 사진이 업데이트되었습니다.', photoUrl });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};