import prisma from '../prisma/client.js';

export const createPickupRequest = async (req, res) => {
  const userId = req.user.userId;
  const { orderId, note = '', inHouse = false } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pickupRequest: true
      }
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: '해당 주문을 찾을 수 없어요.' });
    }

    if (order.pickupRequest) {
      return res.status(400).json({ message: '이미 수거 요청이 등록되었어요.' });
    }

    const pickup = await prisma.pickupRequest.create({
      data: {
        order: { connect: { id: orderId } },
        note,
        inHouse,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PICKUP_REQUESTED' },
    });

    res.status(201).json(pickup);
  } catch (err) {
    console.error('수거 요청 생성 실패:', err);
    res.status(500).json({ message: '서버 오류로 수거 요청을 처리할 수 없어요.' });
  }
};
