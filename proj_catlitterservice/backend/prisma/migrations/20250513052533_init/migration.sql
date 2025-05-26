-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "capacity" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "material" TEXT,
ADD COLUMN     "summary" TEXT;
