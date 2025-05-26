/*
  Warnings:

  - You are about to drop the column `optionId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `sandType` on the `ProductOption` table. All the data in the column will be lost.
  - You are about to drop the column `litterboxType` on the `SubscriptionTier` table. All the data in the column will be lost.
  - You are about to drop the column `sandAmount` on the `SubscriptionTier` table. All the data in the column will be lost.
  - You are about to drop the column `sandType` on the `SubscriptionTier` table. All the data in the column will be lost.
  - Added the required column `sandOptionId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `litterboxSize` to the `SubscriptionTier` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('LITTERBOX', 'SAND', 'SCOOP', 'BAG');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_optionId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "optionId",
ADD COLUMN     "sandOptionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "size" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ProductType" NOT NULL;

-- AlterTable
ALTER TABLE "ProductOption" DROP COLUMN "sandType",
ALTER COLUMN "grainSize" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SubscriptionTier" DROP COLUMN "litterboxType",
DROP COLUMN "sandAmount",
DROP COLUMN "sandType",
ADD COLUMN     "litterboxSize" TEXT NOT NULL,
ADD COLUMN     "maxLitterboxesPerOrder" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "monthlySandLimitLitre" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sandOptionId_fkey" FOREIGN KEY ("sandOptionId") REFERENCES "ProductOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
