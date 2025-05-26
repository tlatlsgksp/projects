/*
  Warnings:

  - You are about to drop the column `sandOptionId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `ProductOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_sandOptionId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOption" DROP CONSTRAINT "ProductOption_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "sandOptionId";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "averageRating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "brand" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "imageUrls" TEXT[];

-- DropTable
DROP TABLE "ProductOption";
