import { Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";

// ✅ Context
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.remove();
      toast.error("로그인이 필요해요");
    }
  }, [loading, isAuthenticated]);

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PrivateRoute;