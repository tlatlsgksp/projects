import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// ✅ Context
import { usePayment } from "../context/PaymentContext";

const PaymentBillingSuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { submitBilling } = usePayment();

  useEffect(() => {
    const authKey = params.get("authKey");
    const tierId = params.get("tierId");

    if (!authKey || !tierId) {
      navigate("/subscriptionssign");
      return;
    }

    submitBilling({ authKey, tierId })
      .then(() => navigate("/subscriptionssign"))
      .catch(() => navigate("/subscriptionssign"));
  }, [params, navigate, submitBilling]);

  return <div className="p-10 text-center">⏳ 결제를 확인 중이에요...</div>;
};

export default PaymentBillingSuccessPage;