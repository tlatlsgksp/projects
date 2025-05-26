import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCurrentUser,
  updateUserInfo,
  changePassword,
} from "../api/user";
import {
  login,
  register,
  checkUsername,
  checkEmail,
} from "../api/auth";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.error("현재 사용자 정보 불러오기 실패:", err);
        toast.error("사용자 정보를 불러오지 못했어요.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithToken = useCallback(async (username, password) => {
    try {
      const res = await login(username, password);
      const { token, message } = res.data;

      localStorage.setItem("token", token);
      await fetchCurrentUser();
      toast.success(message || "로그인 성공!");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        (err.response?.status === 404
          ? "아이디가 존재하지 않아요"
          : err.response?.status === 401
          ? "비밀번호가 틀렸어요"
          : "로그인 중 오류가 발생했어요")
      );
      throw err;
    }
  }, [fetchCurrentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    toast.success("로그아웃 되었어요.");
  }, []);

  const updateUser = useCallback(async (data) => {
    if (!isAuthenticated || !data) return;
    try {
      const res = await updateUserInfo(data);
      setUser(res.data);
      toast.success("정보가 수정되었어요.");
    } catch {
      toast.error("정보 수정에 실패했어요.");
    }
  }, [isAuthenticated]);

  const updatePassword = useCallback(async (data) => {
    if (!isAuthenticated || !data) return;
    try {
      await changePassword(data);
      toast.success("비밀번호가 변경되었어요.");
    } catch {
      toast.error("비밀번호 변경 실패");
    }
  }, [isAuthenticated]);

  const registerUser = useCallback(async (formData) => {
    try {
      const res = await register(formData);
      toast.success(res.data.message || "회원가입 성공!");
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || "회원가입 실패");
      throw err;
    }
  }, []);

  const checkUsernameAvailable = useCallback(async (username) => {
    if (!username) return;
    try {
      const res = await checkUsername(username);
      toast.success(res.data.message || "사용 가능한 아이디예요");
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || "아이디 확인 실패");
      throw err;
    }
  }, []);

  const checkEmailAvailable = useCallback(async (email) => {
    if (!email) return;
    try {
      const res = await checkEmail(email);
      toast.success(res.data.message || "사용 가능한 이메일이에요");
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || "이메일 확인 실패");
      throw err;
    }
  }, []);

  useEffect(() => {
    const publicPrefixes = ["/", "/login", "/register", "/products", "/about"];
    const isPublic = publicPrefixes.some(prefix =>
      window.location.pathname === prefix || window.location.pathname.startsWith(prefix + "/")
    );

    if (!isPublic) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        loginWithToken,
        logout,
        fetchCurrentUser,
        updateUser,
        updatePassword,
        registerUser,
        checkUsernameAvailable,
        checkEmailAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);