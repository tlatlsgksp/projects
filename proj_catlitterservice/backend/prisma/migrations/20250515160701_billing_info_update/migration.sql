/*
  Warnings:

  - A unique constraint covering the columns `[customerKey]` on the table `BillingInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BillingInfo" ALTER COLUMN "billingKey" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BillingInfo_customerKey_key" ON "BillingInfo"("customerKey");
