const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbconfig');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../auth.env') });

// 회원가입
exports.registerUser = async (req, res) => {
    const { name, id, password, nickname, email, dob, profile_pic} = req.body;
        const currentDate = new Date().toISOString();
    
        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const query = 'INSERT INTO users (name, id, password, nickname, email, dob, profile_pic, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(query, [name, id, hashedPassword, nickname, email, dob, profile_pic || null, currentDate, currentDate], function (err) {
            if (err) {
                console.error('Error inserting user data:', err.message);
                return res.status(500).json({ message: '회원가입에 실패했습니다.' });
            }
            res.status(201).json({ message: '회원가입이 완료되었습니다.' });
        });
    };

// 로그인
exports.loginUser = async (req, res) => {
    const { id, password } = req.body;
    const query = 'SELECT * FROM users WHERE id = ?';
    
    db.get(query, [id], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: '서버 오류' });
        }
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
    
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });
    
        const token = jwt.sign({ id: user.id, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
        });
};

// 로그아웃 (프론트엔드에서 토큰 삭제 방식)
exports.logoutUser = (req, res) => {
    res.json({ message: '로그아웃 성공' });
};

// 이메일 인증 코드 발송
exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    const generate4DigitRandom = () => Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCode = generate4DigitRandom(); // 인증 코드 생성 (4자리 랜덤 숫자)
    
        // Nodemailer로 이메일 전송
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            auth: {
                user: process.env.GOOGLE_MAIL,
                pass: process.env.GOOGLE_PASSWORD
            }
        });
    
        const mailOptions = {
            from: process.env.GOOGLE_MAIL,
            to: email,
            subject: '이메일 인증 코드',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
                <h2 style="color: #4CAF50; text-align: center;">이메일 인증 코드</h2>
                <p style="font-size: 16px; color: #333; text-align: center;">
                    안녕하세요,<br> 아래의 인증 코드를 사용하여 회원가입을 완료해 주세요.
                </p>
                <div style="font-size: 24px; font-weight: bold; color: #fff; background-color: #4CAF50; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
                    ${verificationCode}
                </div>
                <p style="font-size: 14px; color: #555; text-align: center;">
                    이 코드는 10분 동안 유효합니다.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; text-align: center; color: #777;">
                    본 이메일은 자동 발신 메일이므로 회신하지 마세요.
                </p>
            </div>
        `
        };
    
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
            } else {
                res.json({ message: '인증 코드가 전송되었습니다.', verificationCode });
            }
          })
    };

// 아이디 중복 확인
exports.checkIdAvailability = (req, res) => {
    const { id } = req.body;
    const query = 'SELECT id FROM users WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (row) {
            res.json({ available: false });
        } else {
            res.json({ available: true });
        }
    });
};

// 닉네임 중복 확인
exports.checkNicknameAvailability = (req, res) => {
    const { nickname } = req.body;
    const query = 'SELECT nickname FROM users WHERE nickname = ?';
    db.get(query, [nickname], (err, row) => {
        if (row) {
            res.json({ available: false });
        } else {
            res.json({ available: true });
        }
    });
};

// 비밀번호 재설정
exports.resetPassword = (req, res) => {
    const { id } = req.body;
    const query = 'SELECT id FROM users WHERE id = ?';
    
    db.get(query, [id], (err, user) => {
        if (err) return res.status(500).json({ message: '서버 오류' });
        if (!user) return res.status(400).json({ message: 'User not found' });
    
        const resetToken = crypto.randomBytes(32).toString('hex');
        res.json({ message: 'Password reset link generated', resetToken });
    });
};

// 비밀번호 업데이트
exports.updatePassword = (req, res) => {
    const { resetToken, newPassword } = req.body;
    const query = 'UPDATE users SET password = ? WHERE reset_token = ?';
    
    // 실제로는 resetToken을 검증하는 로직이 추가되어야 함
    const hashedPassword = bcrypt.hash(newPassword, 10);
    
    // resetToken 관련 로직 생략
    // 예시로 사용자 ID를 직접 업데이트한다고 가정
    db.run(query, [hashedPassword, resetToken], function (err) {
        if (err) {
            return res.status(500).json({ message: '서버 오류' });
        }
        res.json({ message: 'Password updated successfully' });
    });
};

// 보호된 페이지
exports.protectedRoute = (req, res) => {
    res.json({ message: `환영합니다, ${req.user.id}님!` });
};