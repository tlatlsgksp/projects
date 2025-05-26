import prisma from '../prisma/client.js';

// 전체 요금제 조회 (구독자 수 포함)
export const getAllTiers = async (req, res) => {
  const tiers = await prisma.subscriptionTier.findMany({
    include: {
      subscriptions: true
    },
    orderBy: {
      price: 'asc'
    }
  });
  res.json(tiers);
};

// 요금제 생성
export const createTier = async (req, res) => {
  const {
    name,
    price,
    pickupPerMonth,
    extra,
    maxLitterboxesPerOrder,
    monthlySandLimitLitre
  } = req.body;

  const newTier = await prisma.subscriptionTier.create({
    data: {
      name,
      price,
      pickupPerMonth,
      extra,
      maxLitterboxesPerOrder,
      monthlySandLimitLitre
    }
  });

  res.status(201).json(newTier);
};

// 요금제 수정
export const updateTier = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    pickupPerMonth,
    extra,
    maxLitterboxesPerOrder,
    monthlySandLimitLitre
  } = req.body;

  const updated = await prisma.subscriptionTier.update({
    where: { id: Number(id) },
    data: {
      name,
      price,
      pickupPerMonth,
      extra,
      maxLitterboxesPerOrder,
      monthlySandLimitLitre
    }
  });

  res.json(updated);
};

// 요금제 삭제
export const deleteTier = async (req, res) => {
  const { id } = req.params;
  await prisma.subscriptionTier.delete({
    where: { id: Number(id) }
  });
  res.status(204).send();
};