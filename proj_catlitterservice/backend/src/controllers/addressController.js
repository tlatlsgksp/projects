import prisma from '../prisma/client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedPath = path.resolve(__dirname, '../../../shared/non_serviceable_addresses.json');
const nonServiceableAddresses = JSON.parse(fs.readFileSync(sharedPath, 'utf-8'));

// ✅ 내 주소 목록 조회
export const getMyAddresses = async (req, res) => {
  const userId = req.user.userId;
  try {
    const addresses = await prisma.address.findMany({
      where: {
        userId,
        isActive: false,
      },
      orderBy: { isDefault: 'desc' },
    });
    res.json(addresses);
  } catch (error) {
    console.error("주소 조회 실패:", error);
    res.status(500).json({ error: '주소 조회 실패' });
  }
};

// ✅ 어드민용 전체 주소 조회
export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(addresses);
  } catch (error) {
    console.error("전체 주소 조회 실패:", error);
    res.status(500).json({ error: '전체 주소 조회 실패' });
  }
};

// ✅ 새 주소 추가
export const addAddress = async (req, res) => {
  const { address1, address2, zipcode, isDefault } = req.body;
  const userId = req.user.userId;

  try {
    const isServiceable = !nonServiceableAddresses.some(entry => address1.includes(entry));
    const note = isServiceable ? null : '도서산간 지역으로 인해 서비스가 제한됩니다.';

    const existingAddresses = await prisma.address.findMany({ where: { userId } });
    const shouldBeDefault = existingAddresses.length === 0 || isDefault;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        address1,
        address2,
        zipcode,
        isDefault: !!shouldBeDefault,
        isServiceable,
        note
      },
    });

    res.status(201).json(newAddress);
  } catch (error) {
    console.error("주소 저장 실패:", error);
    res.status(500).json({ error: '주소 저장 실패' });
  }
};

// ✅ 주소 수정
export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { address1, address2, zipcode } = req.body;

  try {
    const isServiceable = !nonServiceableAddresses.some(entry => address1.includes(entry));
    const note = isServiceable ? null : '도서산간 지역으로 인해 서비스가 제한됩니다.';

    const updated = await prisma.address.update({
      where: { id: Number(id) },
      data: { address1, address2, zipcode, isServiceable, note },
    });
    res.json(updated);
  } catch (error) {
    console.error("주소 수정 실패:", error);
    res.status(500).json({ error: '주소 수정 실패' });
  }
};

// ✅ 주소 삭제 + 기본 주소 처리
export const deleteAddress = async (req, res) => {
  const addressId = Number(req.params.id);
  const userId = req.user.userId;

  try {
    const address = await prisma.address.findUnique({ where: { id: addressId } });

    if (!address || address.userId !== userId) {
      return res.status(403).json({ error: '권한이 없어요.' });
    }

    await prisma.address.update({
      where: { id: addressId },
      data: { isActive: true },
    });

    if (address.isDefault) {
      const remaining = await prisma.address.findMany({
        where: {
          userId,
          isActive: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (remaining.length > 0) {
        await prisma.address.update({
          where: { id: remaining[0].id },
          data: { isDefault: true },
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    console.error("주소 삭제 실패:", error);
    res.status(500).json({ error: '주소 삭제 실패' });
  }
};

// ✅ 기본 주소 설정
export const setDefaultAddress = async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  try {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json(updated);
  } catch (error) {
    console.error("기본 주소 설정 실패:", error);
    res.status(500).json({ error: '기본 주소 설정 실패' });
  }
};
