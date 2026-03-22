-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monthlyBudget" DOUBLE PRECISION,
ADD COLUMN     "preferredCurrency" TEXT NOT NULL DEFAULT 'USD';
