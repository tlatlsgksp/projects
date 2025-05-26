import React from 'react';
import { motion } from 'framer-motion';
import OrdersForm from '../components/OrdersForm';

const OrdersNewPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-10"
    >
      <div className="mx-auto">
        <OrdersForm />
      </div>
    </motion.div>
  );
};

export default OrdersNewPage;