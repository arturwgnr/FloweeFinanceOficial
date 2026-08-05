-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastInsightDate",
DROP COLUMN "lastInsightText";

-- CreateTable
CREATE TABLE "InsightHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "month" INTEGER,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsightHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTokenUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyTokenUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsightHistory" ADD CONSTRAINT "InsightHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTokenUsage" ADD CONSTRAINT "DailyTokenUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
