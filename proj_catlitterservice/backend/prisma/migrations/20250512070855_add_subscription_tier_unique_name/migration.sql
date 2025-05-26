/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SubscriptionTier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTier_name_key" ON "SubscriptionTier"("name");
