import { createContext, useContext, useState } from "react";

const OrderPanelContext = createContext();

export const OrderPanelProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <OrderPanelContext.Provider value={{ isOpen, open, close }}>
      {children}
    </OrderPanelContext.Provider>
  );
};

export const useOrderPanel = () => useContext(OrderPanelContext);