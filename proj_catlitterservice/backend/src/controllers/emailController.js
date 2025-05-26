import nodemailer from "nodemailer";

const codes = {};

export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const generate4DigitRandom = () => Math.floor(1000 + Math.random() * 9000).toString();
  const verificationCode = generate4DigitRandom();

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

  try {
    await transporter.sendMail(mailOptions);
    codes[email] = verificationCode;
    res.json({ message: '인증 코드가 전송되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '메일 전송 실패' });
  }
};

export const verifyCode = (req, res) => {
  const email = (req.body.email || "").trim();
  const code = (req.body.code || "").toString();

  const savedCode = (codes[email] || "").toString();

  if (savedCode === code) {
    delete codes[email];
    return res.json({ success: true });
  }

  return res.status(400).json({ message: "인증코드가 일치하지 않습니다." });
};