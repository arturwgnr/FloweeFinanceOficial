/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionTag" DROP CONSTRAINT "TransactionTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionTag" DROP CONSTRAINT "TransactionTag_transactionId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "marked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringGroupId" TEXT;

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "TransactionTag";
