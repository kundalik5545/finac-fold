-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('STOCKS', 'MUTUAL_FUNDS', 'GOLD', 'FIXED_DEPOSIT', 'NPS', 'PF');

-- CreateEnum
CREATE TYPE "InvestmentTransactionType" AS ENUM ('INVEST', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('MANUAL', 'API');

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "investmentId" TEXT;

-- CreateTable
CREATE TABLE "investment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InvestmentType" NOT NULL,
    "symbol" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "currentPrice" DECIMAL(65,4) NOT NULL DEFAULT 0,
    "investedAmount" DECIMAL(65,4) NOT NULL DEFAULT 0,
    "currentValue" DECIMAL(65,4) NOT NULL DEFAULT 0,
    "quantity" DECIMAL(65,4) NOT NULL DEFAULT 0,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "transactionType" "InvestmentTransactionType" NOT NULL,
    "notes" TEXT,
    "investmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "investment_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_price_history" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(65,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" "PriceSource" NOT NULL,
    "investmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "investment_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investment_userId_idx" ON "investment"("userId");

-- CreateIndex
CREATE INDEX "investment_userId_type_idx" ON "investment"("userId", "type");

-- CreateIndex
CREATE INDEX "investment_type_idx" ON "investment"("type");

-- CreateIndex
CREATE INDEX "investment_transaction_investmentId_date_idx" ON "investment_transaction"("investmentId", "date");

-- CreateIndex
CREATE INDEX "investment_transaction_userId_idx" ON "investment_transaction"("userId");

-- CreateIndex
CREATE INDEX "investment_price_history_investmentId_date_idx" ON "investment_price_history"("investmentId", "date");

-- CreateIndex
CREATE INDEX "investment_price_history_userId_idx" ON "investment_price_history"("userId");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment" ADD CONSTRAINT "investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_price_history" ADD CONSTRAINT "investment_price_history_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_price_history" ADD CONSTRAINT "investment_price_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
