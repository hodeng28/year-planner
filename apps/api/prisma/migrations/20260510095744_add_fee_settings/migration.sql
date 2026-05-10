-- CreateTable
CREATE TABLE "FeeSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "buyCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.00015,
    "sellCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.00015,
    "transactionTax" DOUBLE PRECISION NOT NULL DEFAULT 0.002,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeSettings_pkey" PRIMARY KEY ("id")
);
