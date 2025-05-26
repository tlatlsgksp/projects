import prisma from '../prisma/client.js';

// 현재 로그인한 사용자의 구독 조회
export const getMySubscription = async (req, res) => {
  const userId = req.user.userId;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
      select: {
        id: true,
        userId: true,
        tierId: true,
        scheduledTierId: true,
        willCancel: true,
        startDate: true,
        endDate: true,
        isActive: true,
        tier: true,
      },
    });

    if (!subscription) {
      return res.status(404).json({ message: "구독 정보 없음" });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: "서버 오류" });
  }
};

// 구독 생성 (결제 완료 후 호출, 또는 내부 사용)
export const createSubscription = async (userId, tierId) => {
  if (!userId || !tierId || isNaN(tierId)) {
    throw new Error("❌ 유효하지 않은 userId 또는 tierId입니다.");
  }

  const tierExists = await prisma.subscriptionTier.findUnique({
    where: { id: tierId },
  });
  if (!tierExists) {
    throw new Error(`❌ 존재하지 않는 tierId입니다: ${tierId}`);
  }

  const defaultAddress = await prisma.address.findFirst({
    where: {
      userId,
      isDefault: true,
      isActive: false,
    },
  });
  if (!defaultAddress) {
    throw new Error("❌ 기본 주소가 등록되지 않았습니다.");
  }
  if (!defaultAddress.isServiceable) {
    throw new Error("❌ 해당 주소는 도서산간 지역으로 서비스 이용이 불가합니다.");
  }

  const existing = await prisma.subscription.findFirst({ where: { userId } });
  if (existing) {
    await prisma.subscription.delete({ where: { id: existing.id } });
  }

  return await prisma.subscription.create({
    data: {
      userId,
      tierId,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });
};

// 구독 취소
export const cancelSubscription = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const existing = await prisma.subscription.findUnique({
    where: { id: Number(id) },
  });

  if (!existing || existing.userId !== userId) {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const cancelled = await prisma.subscription.update({
    where: { id: Number(id) },
    data: {
      willCancel: true,
    },
  });

  res.json(cancelled);
};

// 구독 다운그레이드 예약
export const downgradeSubscription = async (req, res) => {
  const userId = req.user.userId;
  const { tierId } = req.body;

  try {
    const current = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
    });

    if (!current) {
      return res.status(404).json({ error: "구독 정보가 없습니다." });
    }

    await prisma.subscription.update({
      where: { id: current.id },
      data: { scheduledTierId: tierId },
    });

    res.json({ message: "요금제 변경 예약이 완료되었습니다." });
  } catch (error) {
    console.error("[downgradeSubscription]", error);
    res.status(500).json({ error: "예약 처리 중 오류가 발생했습니다." });
  }
};

// 구독 다운그레이드 취소
export const cancelDowngrade = async (req, res) => {
  const userId = req.user.userId;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "구독 정보 없음" });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { scheduledTierId: null },
    });

    res.json({ message: "요금제 변경 예약이 취소되었습니다." });
  } catch (err) {
    console.error("[cancelDowngrade]", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// 구독 취소 철회
export const revertCancelSubscription = async (req, res) => {
  const userId = req.user.userId;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "구독 정보 없음" });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { willCancel: false },
    });

    res.json({ message: "구독 해지가 철회되었습니다." });
  } catch (err) {
    console.error("[revertCancelSubscription]", err);
    res.status(500).json({ error: "서버 오류" });
  }
};
