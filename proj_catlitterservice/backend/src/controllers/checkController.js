import prisma from '../prisma/client.js';

// 아이디 중복 체크
export const checkUsernameExists = async (username) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user !== null;
};

// 이메일 중복 체크
export const checkEmailExists = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user !== null;
};

// 아이디 중복 확인 API
export const checkUsername = async (req, res) => {
  const { username } = req.body;
  
  try {
    const exists = await checkUsernameExists(username);
    
    if (exists) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }
    
    res.status(200).json({ message: '사용 가능한 아이디입니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};

// 이메일 중복 확인 API
export const checkEmail = async (req, res) => {
  const { email } = req.body;
  
  try {
    const exists = await checkEmailExists(email);
    
    if (exists) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }
    
    res.status(200).json({ message: '사용 가능한 이메일입니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
};