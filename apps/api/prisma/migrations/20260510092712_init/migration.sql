-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "stockCode" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "type" "TradeType" NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tradedAt" TIMESTAMP(3) NOT NULL,
    "targetPrice" INTEGER,
    "stopLossPrice" INTEGER,
    "emotionId" TEXT,
    "patternId" TEXT,
    "strategyId" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trade_stockCode_idx" ON "Trade"("stockCode");

-- CreateIndex
CREATE INDEX "Trade_tradedAt_idx" ON "Trade"("tradedAt");

-- CreateIndex
CREATE INDEX "Trade_type_idx" ON "Trade"("type");

-- CreateIndex
CREATE UNIQUE INDEX "EmotionOption_name_key" ON "EmotionOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PatternOption_name_key" ON "PatternOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyOption_name_key" ON "StrategyOption"("name");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "EmotionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "PatternOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "StrategyOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
