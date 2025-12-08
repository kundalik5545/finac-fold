-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR', 'GBP', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CHECKING', 'CURRENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('DEBIT', 'CREDIT', 'PREPAID', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT');

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "accountNumber" TEXT,
    "bankName" TEXT,
    "accountType" "AccountType",
    "ifscCode" TEXT,
    "branch" TEXT,
    "startingBalance" DECIMAL(65,4) NOT NULL DEFAULT 0,
    "icon" TEXT,
    "color" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountOpeningDate" TIMESTAMP(3),
    "isInsuranceActive" BOOLEAN DEFAULT false,
    "insuranceAmount" DECIMAL(65,4),
    "userId" TEXT NOT NULL,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_card" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "cardNumber" TEXT,
    "cardType" "CardType" NOT NULL,
    "cardIssuer" TEXT,
    "cvv" TEXT,
    "expiryDate" TIMESTAMP(3),
    "limit" DECIMAL(65,4) DEFAULT 0,
    "lastBillAmount" DECIMAL(65,4) DEFAULT 0,
    "paymentDueDay" INTEGER,
    "paymentMethod" TEXT,
    "cardPin" TEXT DEFAULT '1234',
    "paymentStatus" "PaymentStatus",
    "paymentAmount" DECIMAL(65,4) DEFAULT 0,
    "paymentDate" TIMESTAMP(3),
    "color" TEXT,
    "icon" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,

    CONSTRAINT "bank_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,4) NOT NULL,
    "totalDeposit" DECIMAL(65,4) NOT NULL DEFAULT 0.0,
    "totalWithdrawal" DECIMAL(65,4) NOT NULL DEFAULT 0.0,
    "currentBalance" DECIMAL(65,4) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "description" TEXT,
    "bankAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "bank_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_category" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "userId" TEXT,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,4) NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "paymentMethod" "PaymentMethod",

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_account_userId_idx" ON "bank_account"("userId");

-- CreateIndex
CREATE INDEX "bank_account_userId_accountNumber_idx" ON "bank_account"("userId", "accountNumber");

-- CreateIndex
CREATE INDEX "bank_card_userId_idx" ON "bank_card"("userId");

-- CreateIndex
CREATE INDEX "bank_card_bankAccountId_idx" ON "bank_card"("bankAccountId");

-- CreateIndex
CREATE INDEX "bank_transaction_bankAccountId_transactionDate_idx" ON "bank_transaction"("bankAccountId", "transactionDate");

-- CreateIndex
CREATE INDEX "bank_transaction_userId_idx" ON "bank_transaction"("userId");

-- CreateIndex
CREATE INDEX "bank_transaction_userId_transactionType_idx" ON "bank_transaction"("userId", "transactionType");

-- CreateIndex
CREATE INDEX "bank_transaction_transactionDate_idx" ON "bank_transaction"("transactionDate");

-- CreateIndex
CREATE INDEX "category_userId_idx" ON "category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "category_userId_name_key" ON "category"("userId", "name");

-- CreateIndex
CREATE INDEX "sub_category_userId_idx" ON "sub_category"("userId");

-- CreateIndex
CREATE INDEX "sub_category_categoryId_idx" ON "sub_category"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "sub_category_userId_categoryId_name_key" ON "sub_category"("userId", "categoryId", "name");

-- CreateIndex
CREATE INDEX "transaction_userId_idx" ON "transaction"("userId");

-- CreateIndex
CREATE INDEX "transaction_categoryId_idx" ON "transaction"("categoryId");

-- CreateIndex
CREATE INDEX "transaction_date_idx" ON "transaction"("date");

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_card" ADD CONSTRAINT "bank_card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_card" ADD CONSTRAINT "bank_card_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transaction" ADD CONSTRAINT "bank_transaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transaction" ADD CONSTRAINT "bank_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
