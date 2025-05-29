import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ✅ Context
import { useAddress } from '../../context/AddressContext';
import { useOrder } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';

// ✅ Components
import AddressForm from '../Addresses/AddressForm';

const OrdersForm = ({ onComplete, onCancel }) => {
  const navigate = useNavigate();
  const {
    cart,
    subscription,
    refreshCart,
    validateCartWithTier,
  } = useCart();
  const {
    addresses,
    defaultAddressId,
    addNewAddress,
    refreshAddresses
  } = useAddress();
  const { submitOrder } = useOrder();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedAddressObj, setSelectedAddressObj] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [note, setNote] = useState('');
  const [isCartValid, setIsCartValid] = useState(true);

  useEffect(() => {
    setSelectedAddress(defaultAddressId || null);
    refreshCart();
    refreshAddresses();
  }, [defaultAddressId, refreshCart, refreshAddresses]);

  useEffect(() => {
    const found = addresses.find((addr) => addr.id === selectedAddress);
    setSelectedAddressObj(found || null);
  }, [selectedAddress, addresses]);

  useEffect(() => {
    if (subscription?.tier) {
      const result = validateCartWithTier(cart, subscription.tier);
      setIsCartValid(result.valid);
    }
  }, [cart, subscription]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress || typeof selectedAddress !== 'number') {
      return toast.error("주소를 선택하거나 등록해주세요");
    }

    if (!cart.length) return toast.error("장바구니에 담긴 제품이 없어요");

    if (selectedAddressObj && !selectedAddressObj.isServiceable) {
      return toast.error("도서산간 지역으로는 주문이 불가해요");
    }

    const result = validateCartWithTier(cart, subscription?.tier);
    if (!result.valid) {
      return toast.error(result.message || "현재 요금제 한도를 초과했어요.");
    }

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      await submitOrder({
        addressId: selectedAddress,
        isSubscription: true,
        pickupRequested: false,
        note,
        orderItems,
      });

      refreshCart();
      if (onComplete) onComplete();
      navigate('/mypage/orders');
    } catch (err) {
      console.error("주문 에러:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 신규 주문 신청</h2>

      {/* 주소 선택 섹션 */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🏠 배송지 정보</h3>

        {showNewAddressForm ? (
          <AddressForm
            onSubmit={async (formData) => {
              try {
                const newAddress = await addNewAddress(formData);
                await refreshAddresses();
                await refreshCart();
                setSelectedAddress(newAddress.id);
                setShowNewAddressForm(false);
                toast.success("주소가 등록되었어요!");
              } catch (err) {
                toast.error("주소 저장 실패");
              }
            }}
            onCancel={() => setShowNewAddressForm(false)}
          />
        ) : (
          <>
            {/* ✅ 주소가 없는 경우 안내 */}
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500 mb-3">
                등록된 주소가 없어요. 아래 버튼으로 새 주소를 등록해 주세요.
              </p>
            ) : (
              <>
                <select
                  value={selectedAddress || ''}
                  onChange={e => setSelectedAddress(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                >
                  <option value="" disabled>주소를 선택하세요</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.address1} {addr.address2 || ''} ({addr.zipcode}) {addr.isDefault ? '⭐' : ''}
                    </option>
                  ))}
                </select>

                {/* ❌ 도서산간 안내 메시지 */}
                {selectedAddressObj && !selectedAddressObj.isServiceable && (
                  <p className="mt-3 text-sm text-red-600 font-semibold">
                    ❌ 해당 주소는 도서산간 지역으로 배송이 불가합니다.
                  </p>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => setShowNewAddressForm(true)}
              className="mt-3 px-4 py-2 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition"
            >
              + 새 주소 등록
            </button>
          </>
        )}
      </section>

      {!showNewAddressForm && (
        <>
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🛒 주문할 제품</h3>

            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">
                장바구니에 담긴 제품이 없어요. 먼저 제품을 선택해주세요.
              </p>
            ) : (
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                {cart.map((item) => (
                  <li key={item.product.id}>
                    {item.product?.name || '삭제된 제품'} ({item.quantity}개)
                  </li>
                ))}
              </ul>
            )}

            {!isCartValid && (
              <p className="mt-3 text-sm text-red-600 font-semibold">
                ⚠️ 현재 장바구니가 구독 중인 요금제 한도를 초과하고 있어요. 수량을 조정해주세요.
              </p>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📬 요청사항</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2"
              rows={3}
              placeholder="예: 현관 앞에 두고 벨 눌러주세요"
            />
          </section>

          <div className="sticky bottom-0 bg-white border-t pt-4 mt-6 flex justify-end gap-3 pb-4">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition disabled:opacity-50"
              disabled={selectedAddressObj && !selectedAddressObj.isServiceable || !isCartValid}
            >
              주문 요청하기
            </button>
            <button
              type="button"
              onClick={onCancel || (() => navigate(-1))}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition"
            >
              취소
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default OrdersForm;