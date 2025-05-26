import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getTiers } from "../api/tier";
import toast from "react-hot-toast";

const TierContext = createContext();

export const TierProvider = ({ children }) => {
  const [tiers, setTiers] = useState([]);

  const fetchTiers = useCallback(async () => {
    try {
      const res = await getTiers();
      const list = Array.isArray(res.data) ? res.data : [];
      setTiers(list);
    } catch (err) {
      toast.error("요금제를 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  return (
    <TierContext.Provider value={{ tiers, fetchTiers }}>
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => useContext(TierContext);