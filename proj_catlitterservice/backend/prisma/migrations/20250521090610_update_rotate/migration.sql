-- CreateEnum
CREATE TYPE "LitterboxStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'CLEANING', 'DAMAGED', 'LOST');

-- CreateEnum
CREATE TYPE "RotationType" AS ENUM ('DELIVERED', 'PICKED_UP', 'CLEANED', 'ASSIGNED', 'DAMAGED');

-- CreateTable
CREATE TABLE "Litterbox" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "status" "LitterboxStatus" NOT NULL DEFAULT 'AVAILABLE',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Litterbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitterboxRotation" (
    "id" SERIAL NOT NULL,
    "litterboxId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rotationType" "RotationType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitterboxRotation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Litterbox" ADD CONSTRAINT "Litterbox_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litterbox" ADD CONSTRAINT "Litterbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitterboxRotation" ADD CONSTRAINT "LitterboxRotation_litterboxId_fkey" FOREIGN KEY ("litterboxId") REFERENCES "Litterbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitterboxRotation" ADD CONSTRAINT "LitterboxRotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
