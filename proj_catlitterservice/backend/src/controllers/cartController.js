import prisma from '../prisma/client.js';

// ✅ 내 장바구니 전체 조회
export const getMyCart = async (req, res) => {
const userId = req.user?.userId;
  try {
    if (!userId) {
      return res.status(401).json({ message: "인증 정보 없음" });
    }

    const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: {
        product: {
        select: {
            id: true,
            name: true,
            imageUrl: true,
            summary: true,
            type: true,
            capacity: true,
        },
        },
    },
    });

    res.json(cartItems);
  } catch (error) {
    console.error("❌ 장바구니 불러오기 실패:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// ✅ 장바구니에 제품 추가
export const addCartItem = async (req, res) => {
  const userId = req.user.userId;
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity) || 1;
  try {
    const existingItem = await prisma.cart.findFirst({
      where: { userId, productId },
    });

    let result;
    if (existingItem) {
      await prisma.cart.updateMany({
        where: { id: existingItem.id, userId },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
      result = await prisma.cart.findUnique({ where: { id: existingItem.id } });
    } else {
      result = await prisma.cart.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("❌ 장바구니 추가 실패:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// ✅ 장바구니 수량 수정
export const updateCartItem = async (req, res) => {
  const userId = req.user.userId;
  const cartId = parseInt(req.params.id, 10);
  const { quantity } = req.body;

  try {
    const updatedItem = await prisma.cart.updateMany({
      where: { id: cartId, userId },
      data: { quantity },
    });

    if (updatedItem.count === 0) {
      return res.status(404).json({ message: '수정할 장바구니 항목이 없어요' });
    }

    res.json({ message: '수량이 수정되었어요' });
  } catch (error) {
    res.status(500).json({ message: '수량 수정 실패', error: error.message });
  }
};

// ✅ 장바구니 항목 삭제
export const deleteCartItem = async (req, res) => {
  const userId = req.user.userId;
  const cartId = parseInt(req.params.id, 10);

  try {
    await prisma.cart.deleteMany({
      where: { id: cartId, userId },
    });

    res.json({ message: '장바구니에서 삭제했어요' });
  } catch (error) {
    res.status(500).json({ message: '삭제 실패', error: error.message });
  }
};