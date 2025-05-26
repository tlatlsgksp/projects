import prisma from '../prisma/client.js';
import { startOfMonth, endOfMonth } from 'date-fns';

export const getOrderById = async (req, res) => {
  const userId = req.user.userId;
  const orderId = parseInt(req.params.id);

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        orderItems: { include: { product: true } },
        pickupRequest: true,
      },
    });

    if (!order || order.userId !== userId) {
      return res.status(403).json({ message: "해당 주문을 조회할 수 없어요." });
    }

    res.json(order);
  } catch (err) {
    console.error("주문 상세 조회 오류:", err);
    res.status(500).json({ message: "주문 정보를 불러오지 못했어요." });
  }
};

export const createOrder = async (req, res) => {
  const userId = req.user.userId;
  const {
    addressId,
    isSubscription = false,
    pickupRequested = false,
    pickupNote = '',
    orderItems,
  } = req.body;

  if (!addressId || !orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: '필수 정보가 누락되었어요.' });
  }

  // ✅ 구독 상태 확인
  const subscription = await prisma.subscription.findFirst({ where: { userId, isActive: true }});
  const address = await prisma.address.findFirst({ where: { id: addressId }});

  if (!subscription) {
    return res.status(403).json({ message: '구독 중인 사용자만 주문할 수 있어요.' });
  }

  if (!address?.isServiceable) {
    return res.status(400).json({ error: "도서산간 지역은 주문이 불가합니다." });
  }

  try {
    const order = await prisma.order.create({
      data: {
        user: { connect: { id: userId } },
        address: { connect: { id: addressId } },
        isSubscription,
        pickupRequested,
        status: 'PENDING',
        pickupRequest: pickupRequested ? { create: { note: pickupNote } } : undefined,
        orderItems: {
          create: orderItems.map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
          })),
        },
      },
    });
    await prisma.cart.deleteMany({ where: { userId } });

    res.status(201).json(order);
  } catch (err) {
    console.error("주문 생성 실패:", err);
    res.status(500).json({ message: '서버 오류로 주문을 처리할 수 없어요.' });
  }
};

export const cancelOrder = async (req, res) => {
  const userId = req.user.userId;
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
    });

    if (!order || order.userId !== userId) {
      return res.status(403).json({ message: '해당 주문을 취소할 수 없어요.' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: '이미 처리 중인 주문은 취소할 수 없어요.' });
    }

    const cancelled = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'CANCELLED' },
    });

    res.json(cancelled);
  } catch (error) {
    console.error("주문 취소 오류:", error);
    res.status(500).json({ message: '주문 취소에 실패했어요.' });
  }
};

export const getMyOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        orderItems: {
          include: { product: true },
        },
        pickupRequest: true,
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("내 주문 조회 실패:", error);
    res.status(500).json({ message: '내 주문을 불러오지 못했어요.' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        address: true,
        orderItems: { include: { product: true } },
        pickupRequest: true,
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("전체 주문 조회 실패:", error);
    res.status(500).json({ message: '전체 주문을 불러오지 못했어요.' });
  }
};

export const getMonthlyUsage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const orders = await prisma.order.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalSand = 0;
    let totalBag = 0;
    let totalLitterboxes = 0;
    let totalScoops = 0;

    for (const order of orders) {
      for (const item of order.orderItems) {
        const { product, quantity } = item;
        const { type, capacity } = product;

        switch (type) {
          case 'SAND':
            totalSand += (capacity || 0) * quantity;
            break;
          case 'BAG':
            totalBag += (capacity || 0) * quantity;
            break;
          case 'LITTERBOX':
            totalLitterboxes += quantity;
            break;
          case 'SCOOP':
            totalScoops += quantity;
            break;
        }
      }
    }

    return res.json({
      totalSand,
      totalBag,
      totalLitterboxes,
      totalScoops,
    });
  } catch (error) {
    console.error("월간 사용량 계산 오류:", error);
    return res.status(500).json({ message: '월간 사용량 계산에 실패했습니다.' });
  }
};