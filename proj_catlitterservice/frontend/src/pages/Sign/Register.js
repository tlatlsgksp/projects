import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// ✅ Api
import { sendVerificationCode, verifyCode } from "../../api/email";

// ✅ Context
import { useAuth } from "../../context/AuthContext";

const emailDomains = ["직접 입력", "naver.com", "gmail.com", "daum.net", "nate.com"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, checkUsernameAvailable, checkEmailAvailable } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    emailLocal: "",
    emailDomain: "직접 입력",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });

  const [customDomain, setCustomDomain] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  const [usernameChecked, setUsernameChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  useEffect(() => {
    if (timer === 0 && intervalRef.current) clearInterval(intervalRef.current);
  }, [timer]);

  const getEmail = () => {
    const domain = formData.emailDomain === "직접 입력" ? customDomain : formData.emailDomain;
    return `${formData.emailLocal}@${domain}`.trim();
  };

  const startTimer = () => {
    setTimer(600);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}분 ${s < 10 ? "0" : ""}${s}초 남았어요`;
  };

  const validate = () => {
    const newErrors = {};
    const usernameRegex = /^[A-Za-z0-9]+$/;
    const nameRegex = /^[가-힣]+$/;

    if (!formData.username) newErrors.username = "아이디를 입력해주세요";
    else if (!usernameRegex.test(formData.username))
      newErrors.username = "아이디는 영문 대소문자 및 숫자만 가능해요";

    if (!formData.emailLocal || !formData.emailDomain)
      newErrors.email = "이메일을 완성해주세요";

    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요";
    else if (formData.password.length > 20)
      newErrors.password = "비밀번호는 20자 이내여야 해요";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "비밀번호가 일치하지 않아요";

    if (!formData.name) newErrors.name = "이름을 입력해주세요";
    else if (!nameRegex.test(formData.name))
      newErrors.name = "이름은 한글만 입력 가능해요";

    if (!formData.phone) newErrors.phone = "전화번호를 입력해주세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUsernameCheck = async () => {
    if (!formData.username) return toast.error("아이디를 입력해주세요");
    try {
      await checkUsernameAvailable(formData.username);
      setUsernameChecked(true);
      toast.success("사용 가능한 아이디예요");
    } catch {
      setUsernameChecked(false);
    }
  };

  const handleEmailCheck = async () => {
    const email = getEmail();
    if (!formData.emailLocal || !formData.emailDomain)
      return toast.error("이메일을 완성해주세요!");
    try {
      await checkEmailAvailable(email);
      setEmailChecked(true);
      toast.success("사용 가능한 이메일이에요");
    } catch {
      setEmailChecked(false);
    }
  };

  const handleSendVerification = async () => {
    const email = getEmail();
    if (!emailChecked) return toast.error("이메일 중복확인을 해주세요");
    try {
      await sendVerificationCode(email);
      startTimer();
      toast.success("인증코드가 전송됐어요!");
    } catch {
      toast.error("메일 전송에 실패했어요");
    }
  };

  const handleVerifyCode = async () => {
    const email = getEmail();
    if (!verificationCode.trim()) return toast.error("인증코드를 입력해주세요");
    try {
      await verifyCode(email, verificationCode);
      setEmailVerified(true);
      toast.success("이메일 인증이 완료됐어요!");
    } catch {
      toast.error("인증코드가 일치하지 않아요");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsernameChecked(false);
    if (name === "emailLocal" || name === "emailDomain") setEmailChecked(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDomainChange = (e) => {
    const value = e.target.value;
    setEmailChecked(false);
    setFormData((prev) => ({ ...prev, emailDomain: value }));
  };

  const handleReset = () => {
    setFormData({
      username: "",
      emailLocal: "",
      emailDomain: "직접 입력",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
    });
    setCustomDomain("");
    setUsernameChecked(false);
    setEmailChecked(false);
    setTimer(0);
    clearInterval(intervalRef.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!emailVerified) return toast.error("이메일 인증을 완료해주세요");
    if (!usernameChecked || !emailChecked)
      return toast.error("아이디 및 이메일 중복 확인을 해주세요");
    try {
      const email = getEmail();
      await registerUser({ ...formData, email });
      toast.success("회원가입이 완료됐어요!");
      navigate("/login");
    } catch {
      toast.error("회원가입에 실패했어요");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span role="img" aria-label="register">📝</span>
            회원가입
          </h2>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {/* 아이디 */}
            <div>
              <label className="font-semibold">아이디</label>
              <div className="flex gap-2">
                <input name="username" maxLength={20} value={formData.username} onChange={handleChange} className="p-2 border flex-grow rounded" placeholder="아이디" disabled={usernameChecked} />
                <button type="button" onClick={handleUsernameCheck} disabled={usernameChecked} className={`px-3 py-2 rounded-md text-sm ${usernameChecked ? "bg-green-100 text-green-600 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}>
                  중복확인
                </button>
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="font-semibold">이메일</label>
              <div className="flex gap-2 mb-2">
                <input name="emailLocal" placeholder="이메일 아이디" className="p-2 border w-1/2 rounded" value={formData.emailLocal} onChange={handleChange} disabled={emailChecked} />
                <span className="self-center">@</span>
                <select className="p-2 border w-1/2 rounded" value={formData.emailDomain} onChange={handleDomainChange} disabled={emailChecked}>
                  {emailDomains.map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="직접 입력"
                  className={`p-2 border w-full rounded ${formData.emailDomain !== "직접 입력" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  disabled={formData.emailDomain !== "직접 입력" || emailChecked}
                />
                <button type="button" onClick={handleEmailCheck} disabled={emailChecked} className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${emailChecked ? "bg-green-100 text-green-600 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}>
                  이메일 중복확인
                </button>
              </div>

              {/* 인증코드 전송 및 확인 */}
              {!emailVerified ? (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={!emailChecked}
                    className={`w-1/3 px-2 py-2 rounded-md text-sm whitespace-nowrap ${
                      emailChecked ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {timer > 0 ? "재전송" : "인증코드 전송"}
                  </button>
                  <input
                    type="text"
                    placeholder="인증코드"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={!emailChecked}
                    className={`border px-2 py-2 rounded w-1/2 text-sm ${
                      !emailChecked ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={!emailChecked}
                    className={`w-1/3 px-2 py-2 rounded-md text-sm whitespace-nowrap ${
                      emailChecked ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    확인
                  </button>
                </div>
              ) : (
                <p className="text-green-600 mt-1">이메일 인증 완료</p>
              )}

              {timer > 0 && !emailVerified && (
                <p className="text-sm text-gray-600 mt-1">{formatTime(timer)}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="font-semibold">비밀번호</label>
              <input type="password" name="password" maxLength={20} value={formData.password} onChange={handleChange} className="p-2 border w-full rounded" placeholder="비밀번호" />
            </div>

            <div>
              <label className="font-semibold">비밀번호 확인</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="p-2 border w-full rounded" placeholder="비밀번호 확인" />
            </div>

            <div>
              <label className="font-semibold">이름</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="p-2 border w-full rounded" placeholder="이름" />
            </div>

            <div>
              <label className="font-semibold">전화번호</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="p-2 border w-full rounded" placeholder="전화번호 -제외" />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-green-400 hover:bg-green-500 text-white p-2 w-full rounded-md shadow-md font-semibold">
                회원가입
              </button>
              <button type="button" onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-black p-2 w-1/3 rounded-md shadow-md font-medium">
                초기화
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;