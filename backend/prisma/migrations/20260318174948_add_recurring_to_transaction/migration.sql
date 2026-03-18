-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringDay" INTEGER;
