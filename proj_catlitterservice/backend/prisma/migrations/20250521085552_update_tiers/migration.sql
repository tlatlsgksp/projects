-- AlterTable
ALTER TABLE "SubscriptionTier" ADD COLUMN     "activeLitterboxes" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "depositAmount" INTEGER,
ADD COLUMN     "depositRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selfCleanDiscount" INTEGER,
ADD COLUMN     "totalAssignedLitterboxes" INTEGER NOT NULL DEFAULT 2;
