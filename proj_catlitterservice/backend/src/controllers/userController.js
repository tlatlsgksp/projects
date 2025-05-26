import prisma from '../prisma/client.js';
import { hashPassword, comparePasswords } from '../utils/hash.js';

// 사용자 정보 조회
export const getUserInfo = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMySubscription = async (req, res) => {
  const userId = req.user.userId;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: {
        tier: true,
      },
    });

    if (!subscription) {
      return res.status(404).json({ message: "구독 내역이 없습니다." });
    }

    res.json(subscription);
  } catch (err) {
    console.error("내 구독 정보 가져오기 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

export const getMyFavorites = async (req, res) => {
  const userId = req.user.userId;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(
      favorites.map((f) => ({
        ...f.product,
        likedAt: f.createdAt,
      }))
    );
  } catch (err) {
    console.error("좋아요 제품 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

export const updateMyProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, phone } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
    });

    res.json({
      message: "회원 정보가 수정되었습니다.",
      user: {
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (err) {
    console.error("회원정보 수정 실패:", err);
    res.status(500).json({ message: "회원정보 수정에 실패했습니다." });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isMatch = await comparePasswords(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "현재 비밀번호가 일치하지 않습니다." });
    }

    const hashedNew = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNew },
    });

    res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (err) {
    console.error("비밀번호 변경 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

export const toggleFavorite = async (req, res) => {
  const userId = req.user.userId;
  const productId = parseInt(req.params.productId);

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    } else {
      await prisma.favorite.create({ data: { userId, productId } });
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error("좋아요 토글 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};