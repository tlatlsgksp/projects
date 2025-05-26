import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/ko';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
faker.seed(42);

const sharedDir = path.resolve(__dirname, '../../../shared');
const nonServiceable = JSON.parse(fs.readFileSync(path.join(sharedDir, 'non_serviceable_addresses.json'), 'utf-8'));
const serviceable = JSON.parse(fs.readFileSync(path.join(sharedDir, 'serviceable_addresses.json'), 'utf-8'));
const productsSeed = JSON.parse(fs.readFileSync(path.join(sharedDir, 'products_data.json'), 'utf-8'));

const tiers = [
  {
    name: '소형 기본 요금제', price: 19000, pickupPerMonth: 1, extra: '기본 수거 서비스 포함',
    maxLitterboxesPerOrder: 1, maxScoopsPerOrder: 1, monthlySandLimitLitre: 15, monthlyBagLimitLitre: 10,
    activeLitterboxes: 1, totalAssignedLitterboxes: 2, depositRequired: true, depositAmount: 10000
  },
  {
    name: '중형 플러스 요금제', price: 29000, pickupPerMonth: 2, extra: '화장실, 모래 등 기타 제품 추가 제공',
    maxLitterboxesPerOrder: 2, maxScoopsPerOrder: 2, monthlySandLimitLitre: 30, monthlyBagLimitLitre: 20,
    activeLitterboxes: 2, totalAssignedLitterboxes: 4, depositRequired: true, depositAmount: 20000
  },
  {
    name: '대형 프리미엄 요금제', price: 39000, pickupPerMonth: 4, extra: '더 많은 화장실, 모래 등 기타 제품 추가 제공!',
    maxLitterboxesPerOrder: 4, maxScoopsPerOrder: 4, monthlySandLimitLitre: 60, monthlyBagLimitLitre: 30,
    activeLitterboxes: 4, totalAssignedLitterboxes: 8, depositRequired: true, depositAmount: 40000
  }
];

function getAddress() {
  const useNonServiceable = Math.random() < 0.2;
  const entry = faker.helpers.arrayElement(useNonServiceable ? nonServiceable : serviceable);
  return {
    address1: entry.address,
    address2: faker.location.secondaryAddress(),
    zipcode: entry.zipcode,
    isServiceable: !useNonServiceable,
    note: useNonServiceable ? '도서산간 지역으로 인해 배송 및 수거가 불가합니다.' : null
  };
}

const resetSequences = async () => {
  const sequences = await prisma.$queryRawUnsafe(`
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  `);
  for (const seq of sequences) {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${seq.sequence_name}" RESTART WITH 1`);
  }
};

const main = async () => {
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.pickupRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.billingInfo.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.litterboxRotation.deleteMany();
  await prisma.litterbox.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subscriptionTier.deleteMany();
  await resetSequences();
  console.log('✅ 기존 데이터 삭제 완료');

  const password = await bcrypt.hash('test', 10);
  const users = await Promise.all(
    Array.from({ length: 50 }).map((_, i) =>
      prisma.user.create({
        data: {
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          password,
          name: faker.person.fullName(),
          phone: faker.phone.number('010########'),
          role: i === 0 ? 'ADMIN' : 'USER'
        }
      })
    )
  );
  console.log('✅ 사용자 생성 완료');

  for (const user of users) {
    await prisma.billingInfo.create({
      data: {
        userId: user.id,
        customerKey: user.uuid,
        billingKey: ''
      }
    });
  }

  const tierRecords = await Promise.all(tiers.map(t => prisma.subscriptionTier.create({ data: t })));
  console.log('✅ 요금제 생성 완료');

  const createdProducts = await Promise.all(productsSeed.map(p => prisma.product.create({ data: p })));
  console.log(`✅ 제품 ${createdProducts.length}개 생성 완료`);

  const addressMap = new Map();

  for (const user of users) {
    const { address1, address2, zipcode, isServiceable, note } = getAddress();
    const address = await prisma.address.create({
      data: { userId: user.id, address1, address2, zipcode, isServiceable, note, isDefault: true }
    });
    addressMap.set(user.id, address.id);

    if (!isServiceable) continue;

    const tier = faker.helpers.arrayElement(tierRecords);
    const startDate = faker.date.past();
    const endDate = faker.date.future();

    await prisma.subscription.create({
      data: {
        userId: user.id,
        tierId: tier.id,
        startDate,
        endDate,
        isActive: true,
        nextPickup: faker.date.soon()
      }
    });

    const litterboxProduct = createdProducts.find(p => p.type === 'LITTERBOX');
    for (let j = 0; j < tier.totalAssignedLitterboxes; j++) {
      const box = await prisma.litterbox.create({
        data: {
          userId: user.id,
          productId: litterboxProduct.id,
          status: j < tier.activeLitterboxes ? 'IN_USE' : 'CLEANING'
        }
      });
      await prisma.litterboxRotation.create({
        data: {
          litterboxId: box.id,
          userId: user.id,
          rotationType: 'ASSIGNED',
          scheduledDate: new Date(),
          completed: true,
          note: '초기 배정'
        }
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: address.id,
        status: 'DELIVERED',
        isSubscription: true,
        deliveryDate: new Date()
      }
    });

    if (Math.random() < 0.7) {
      await prisma.pickupRequest.create({
        data: {
          orderId: order.id,
          note: '문 앞에 두세요.',
          inHouse: false
        }
      });
    }

    const orderedProducts = faker.helpers.arrayElements(createdProducts, 3);
    for (const product of orderedProducts) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 2 })
        }
      });
    }
  }

  console.log('✅ 구독/주문/수거 생성 완료');

  for (const user of users) {
    const favorites = faker.helpers.arrayElements(createdProducts, 20);
    for (const product of favorites) {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          productId: product.id
        }
      });
    }
  }
  console.log('✅ 좋아요(favorite) 생성 완료');

  const validUserIds = users.map(u => u.id);
  const validProductIds = createdProducts.map(p => p.id);
  const reviewTemplates = [
    '정말 만족스럽습니다. 고양이도 잘 사용해요.',
    '배송 빠르고 포장도 깔끔했어요.',
    '크기 딱 적당하고 냄새도 안 나요.',
    '디자인이 세련돼서 인테리어랑 잘 어울려요.',
    '설명대로 기능도 좋고 만족합니다.',
    '처음엔 걱정했는데 고양이가 너무 좋아하네요.',
    '다른 제품보다 훨씬 튼튼하고 좋아요.',
    '재구매 의사 있습니다. 추천합니다!',
    '모래 뭉침도 좋고 청소도 쉬워요.',
    '조금 비싸지만 그만한 가치가 있어요.',
    '품질이 아주 좋아서 믿고 쓸 수 있어요.',
    '우리 고양이한테 딱 맞는 크기네요.',
    '친구에게도 추천했어요. 좋은 제품입니다.',
    '모래 먼지 없고 발에도 잘 안 묻어요.',
    '화장실 냄새가 거의 없어졌어요.'
  ];

  let createdCount = 0;
  
  for (let i = 0; i < 500; i++) {
    const userId = faker.helpers.arrayElement(validUserIds);
    const productId = faker.helpers.arrayElement(validProductIds);

    const alreadyExists = await prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });
    if (alreadyExists) {
      continue; // 이미 있음 => 건너뜀
    }

    const rating = faker.helpers.arrayElement([5, 4, 4, 3, 5, 3, 2, 1]);
    const content = faker.helpers.arrayElement(reviewTemplates);
    const imageUrls = Math.random() < 0.3 ? [`/uploads/review_${faker.string.uuid().slice(0, 8)}.jpg`] : [];

    await prisma.review.create({
      data: { userId, productId, rating, content, imageUrls }
    });

    const ratings = await prisma.review.findMany({ where: { productId } });
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await prisma.product.update({
      where: { id: productId },
      data: { averageRating: parseFloat(avg.toFixed(1)) }
    });
    createdCount++;
  }

  console.log(`✅ 리뷰 ${createdCount}개 생성 완료`);
};

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
