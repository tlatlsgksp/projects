-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isServiceable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "note" TEXT;
