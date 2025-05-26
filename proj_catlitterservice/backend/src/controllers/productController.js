import prisma from '../prisma/client.js';

export const getAllProducts = async (req, res) => {
  try {
    const {
      type = '',
      size = '',
      material = '',
      sort = 'latest',
      page = 1,
      limit = 8,
    } = req.query;

    const where = {};
    if (type) where.type = type;
    if (size) where.size = size;
    if (material) where.material = material;

    const orderBy =
      sort === 'likes'
        ? { favorites: { _count: 'desc' } }
        : sort === 'name'
        ? { name: 'asc' }
        : { createdAt: 'desc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: { favorites: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const totalCount = await prisma.product.count({ where });

    res.json({ products, totalCount });
  } catch (error) {
    console.error("제품 목록 조회 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: true,
        favorites: true,
      }
    });
    if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    res.json(product);
  } catch (err) {
    console.error('❌ getProductById 오류:', err);
    res.status(500).json({ error: '상품 상세를 불러오는 중 오류 발생' });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        favorites: true,
      },
      where: {
        isActive: true,
      },
    });

    const sorted = products
      .sort((a, b) => b.favorites.length - a.favorites.length)
      .slice(0, 20);

    res.json(sorted);
  } catch (err) {
    console.error("추천 제품 불러오기 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

export const createProduct = async (req, res) => {
  const {
    name,
    summary,
    description,
    material,
    dimensions,
    capacity,
    type,
    size,
    isActive,
    isRequired,
    imageUrl,
    imageUrls
  } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      summary,
      description,
      material,
      dimensions,
      capacity,
      type,
      size,
      grainsize,
      isActive,
      isRequired,
      imageUrl,
      imageUrls
    }
  });

  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    summary,
    description,
    material,
    dimensions,
    capacity,
    type,
    size,
    grainsize,
    isActive,
    isRequired,
    imageUrl,
    imageUrls
  } = req.body;

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      name,
      summary,
      description,
      material,
      dimensions,
      capacity,
      type,
      size,
      grainsize,
      isActive,
      isRequired,
      imageUrl,
      imageUrls
    }
  });

  res.json(updated);
};

export const deleteProduct = async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
};

export const getVariantsByProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: '잘못된 제품 ID입니다.' });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });

  let where = {
    brand: product.brand,
    type: product.type,
    id: { not: product.id },
  };

  switch (product.type) {
    case 'LITTERBOX':
      where.material = product.material;
      where.shape = product.shape;
      break;

    case 'SAND':
      where.material = product.material;
      break;

    case 'SCOOP':
    case 'BAG':
      where.material = product.material;
      break;

    default:
      // 예외 처리
      return res.status(400).json({ message: '지원하지 않는 제품 타입입니다.' });
  }

  const variants = await prisma.product.findMany({
    where,
    orderBy: {
      size: 'asc', // 일부 타입엔 size가 없을 수 있으므로 필요 시 capacity 기준 정렬도 추가
    },
  });

  return res.json(variants);
};