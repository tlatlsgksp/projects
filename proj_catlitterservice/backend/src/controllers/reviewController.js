import prisma from "../prisma/client.js";

// ✅ 제품별 리뷰 목록 + 평균 별점
export const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });

    const avgRating = await prisma.review.aggregate({
      where: { productId: parseInt(productId) },
      _avg: { rating: true },
    });

    res.json({ reviews, averageRating: avgRating._avg.rating || 0 });
  } catch (err) {
    console.error("리뷰 조회 실패:", err);
    res.status(500).json({ error: "리뷰 조회 실패" });
  }
};

export const createReview = async (req, res) => {
  const userId = req.user.userId;
  const { productId, rating, content, imageUrls } = req.body;

  try {
    // 이미 작성했는지 확인
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    if (existing) {
      return res.status(400).json({ error: "이미 리뷰를 작성하셨어요." });
    }

    // TODO: 주문 이력 확인 (배송 완료 여부 등)

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        content,
        imageUrls,
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("리뷰 생성 실패:", err);
    res.status(500).json({ error: "리뷰 생성 실패" });
  }
};

export const updateReview = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { rating, content, imageUrls } = req.body;

  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: "수정 권한이 없어요." });
    }

    const updated = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { rating, content, imageUrls },
    });

    res.json(updated);
  } catch (err) {
    console.error("리뷰 수정 실패:", err);
    res.status(500).json({ error: "리뷰 수정 실패" });
  }
};

export const deleteReview = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: "삭제 권한이 없어요." });
    }

    await prisma.review.delete({ where: { id: parseInt(id) } });
    res.json({ message: "리뷰 삭제 완료" });
  } catch (err) {
    console.error("리뷰 삭제 실패:", err);
    res.status(500).json({ error: "리뷰 삭제 실패" });
  }
};