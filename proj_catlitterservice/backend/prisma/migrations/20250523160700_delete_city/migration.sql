/*
  Warnings:

  - You are about to drop the column `city` on the `Address` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERING';

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "city";
