import prisma from '../prisma/client.js';
import { hashPassword, comparePasswords } from '../utils/hash.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// 회원가입
export const register = async (req, res) => {
  const { username, email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
      },
    });
    await prisma.billingInfo.create({
      data: {
        userId: newUser.id,
        customerKey: newUser.uuid,
        billingKey: "",
      },
    });

    res.status(201).json({ message: "회원가입 완료", userId: newUser.id });
  } catch (err) {
    console.error("회원가입 실패:", err);
    res.status(500).json({ message: "회원가입 중 오류 발생" });
  }
};

// 로그인
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력하세요.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: '존재하지 않는 아이디입니다.' });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: '로그인 성공', token });
  } catch (err) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};