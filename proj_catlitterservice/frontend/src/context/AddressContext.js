import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../api/address';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const { isAuthenticated } = useAuth();

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMyAddresses();
      const list = Array.isArray(res.data) ? res.data : [];
      setAddresses(list);
      const defaultOne = list.find((addr) => addr.isDefault);
      setDefaultAddressId(defaultOne?.id || null);
    } catch (err) {
      console.error("주소 불러오기 실패", err);
      setAddresses([]);
      setDefaultAddressId(null);
    }
  }, [isAuthenticated]);

  const addNewAddress = useCallback(async (data) => {
    if (!isAuthenticated || !data?.address1 || !data?.address2 || !data?.zipcode) return;
    try {
      const res = await createAddress(data);
      toast.success('주소가 추가되었어요!');
      await refreshAddresses();
      return res.data;
    } catch (err) {
      console.error(err);
      toast.error('주소 추가에 실패했어요.');
      return null;
    }
  }, [isAuthenticated, refreshAddresses]);

  const updateAddressById = useCallback(async (id, data) => {
    if (!isAuthenticated || !id || !data) return;
    try {
      await updateAddress(id, data);
      toast.success('주소가 수정되었어요!');
      await refreshAddresses();
    } catch (err) {
      console.error(err);
      toast.error('주소 수정에 실패했어요.');
    }
  }, [isAuthenticated, refreshAddresses]);

  const deleteAddressById = useCallback(async (id) => {
    if (!isAuthenticated || !id) return;
    try {
      await deleteAddress(id);
      toast.success('주소가 삭제되었어요!');
      await refreshAddresses();
    } catch (err) {
      console.error(err);
      toast.error('주소 삭제에 실패했어요.');
    }
  }, [isAuthenticated, refreshAddresses]);

  const setAsDefaultAddress = useCallback(async (id) => {
    if (!isAuthenticated || !id) return;
    try {
      await setDefaultAddress(id);
      toast.success('기본 주소가 설정되었어요!');
      await refreshAddresses();
    } catch (err) {
      console.error(err);
      toast.error('기본 주소 설정에 실패했어요.');
    }
  }, [isAuthenticated, refreshAddresses]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddressId,
        refreshAddresses,
        addNewAddress,
        updateAddressById,
        deleteAddressById,
        setAsDefaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);