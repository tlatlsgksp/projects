import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSubscription } from "../../context/SubscriptionContext";

const SubscriptionsRoute = () => {
  const { subscription, loading } = useSubscription();
  const location = useLocation();

  const isSubscribed = !!subscription && subscription.isActive;

  useEffect(() => {
    if (!loading && !isSubscribed) {
      toast.remove();
      toast.error("구독 후 이용할 수 있어요.");
    }
  }, [loading, isSubscribed]);

  if (loading) return null;

  if (!isSubscribed) {
    return <Navigate to="/subscriptionssign" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default SubscriptionsRoute;