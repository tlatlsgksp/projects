-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "scheduledTierId" INTEGER;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_scheduledTierId_fkey" FOREIGN KEY ("scheduledTierId") REFERENCES "SubscriptionTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
