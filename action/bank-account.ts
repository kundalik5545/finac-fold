"use server";

import prisma from "@/lib/prisma";
import {
  BankAccount,
  BankTransaction,
  BankCard,
  Category,
  SubCategory,
  Transaction,
} from "@/lib/schema/bank-account-types";
import { Prisma } from "@/app/generated/prisma/client";

// ============================================
// BANK ACCOUNT FUNCTIONS
// ============================================

/**
 * Fetch all bank accounts for a user
 */
export async function getBankAccounts(userId: string): Promise<BankAccount[]> {
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return bankAccounts.map((account) => ({
      ...account,
      startingBalance: Number(account.startingBalance),
      insuranceAmount: account.insuranceAmount
        ? Number(account.insuranceAmount)
        : null,
    }));
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    throw new Error("Failed to fetch bank accounts");
  }
}

/**
 * Fetch a single bank account with its transactions and cards
 */
export async function getBankAccount(
  bankAccountId: string,
  userId: string
): Promise<
  BankAccount & { bankTransactions: BankTransaction[]; bankCards: BankCard[] }
> {
  try {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        userId,
      },
      include: {
        bankTransactions: {
          orderBy: {
            transactionDate: "desc",
          },
        },
        bankCards: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    return {
      ...bankAccount,
      startingBalance: Number(bankAccount.startingBalance),
      insuranceAmount: bankAccount.insuranceAmount
        ? Number(bankAccount.insuranceAmount)
        : null,
      bankTransactions: bankAccount.bankTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        totalDeposit: Number(t.totalDeposit),
        totalWithdrawal: Number(t.totalWithdrawal),
        currentBalance: Number(t.currentBalance),
      })),
      bankCards: bankAccount.bankCards.map((card) => ({
        ...card,
        limit: card.limit ? Number(card.limit) : null,
        lastBillAmount: card.lastBillAmount
          ? Number(card.lastBillAmount)
          : null,
        paymentAmount: card.paymentAmount ? Number(card.paymentAmount) : null,
      })),
    };
  } catch (error) {
    console.error("Error fetching bank account:", error);
    throw new Error("Failed to fetch bank account");
  }
}

/**
 * Create a new bank account
 */
export async function createBankAccount(
  data: Omit<
    Prisma.BankAccountCreateInput,
    "user" | "bankTransactions" | "bankCards" | "transactions"
  >,
  userId: string
): Promise<BankAccount> {
  try {
    const bankAccount = await prisma.bankAccount.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });

    return {
      ...bankAccount,
      startingBalance: Number(bankAccount.startingBalance),
      insuranceAmount: bankAccount.insuranceAmount
        ? Number(bankAccount.insuranceAmount)
        : null,
    };
  } catch (error) {
    console.error("Error creating bank account:", error);
    throw new Error("Failed to create bank account");
  }
}

/**
 * Update a bank account
 */
export async function updateBankAccount(
  bankAccountId: string,
  data: Partial<
    Omit<
      Prisma.BankAccountUpdateInput,
      "user" | "bankTransactions" | "bankCards" | "transactions"
    >
  >,
  userId: string
): Promise<BankAccount> {
  try {
    // Verify ownership
    const existing = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!existing) {
      throw new Error("Bank account not found");
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id: bankAccountId },
      data,
    });

    return {
      ...bankAccount,
      startingBalance: Number(bankAccount.startingBalance),
      insuranceAmount: bankAccount.insuranceAmount
        ? Number(bankAccount.insuranceAmount)
        : null,
    };
  } catch (error) {
    console.error("Error updating bank account:", error);
    throw new Error("Failed to update bank account");
  }
}

/**
 * Delete a bank account (cascade deletes transactions and cards)
 */
export async function deleteBankAccount(
  bankAccountId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!existing) {
      throw new Error("Bank account not found");
    }

    await prisma.bankAccount.delete({
      where: { id: bankAccountId },
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    throw new Error("Failed to delete bank account");
  }
}

/**
 * Calculate current balance for a bank account
 * Balance = startingBalance + sum(credit transactions) - sum(debit transactions)
 */
export async function calculateBalance(
  bankAccountId: string,
  userId: string
): Promise<number> {
  try {
    // Verify ownership
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    const transactions = await prisma.bankTransaction.findMany({
      where: {
        bankAccountId,
        userId,
      },
    });

    const startingBalance = Number(bankAccount.startingBalance);
    const totalCredits = transactions
      .filter((t) => t.transactionType === "CREDIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDebits = transactions
      .filter((t) => t.transactionType === "DEBIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return startingBalance + totalCredits - totalDebits;
  } catch (error) {
    console.error("Error calculating balance:", error);
    throw new Error("Failed to calculate balance");
  }
}

// ============================================
// BANK TRANSACTION FUNCTIONS
// ============================================

/**
 * Get all transactions for a bank account
 */
export async function getBankTransactions(
  bankAccountId: string,
  userId: string
): Promise<BankTransaction[]> {
  try {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    const transactions = await prisma.bankTransaction.findMany({
      where: {
        bankAccountId,
        userId,
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    return transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      totalDeposit: Number(t.totalDeposit),
      totalWithdrawal: Number(t.totalWithdrawal),
      currentBalance: Number(t.currentBalance),
    }));
  } catch (error) {
    console.error("Error fetching bank transactions:", error);
    throw new Error("Failed to fetch bank transactions");
  }
}

/**
 * Create a new bank transaction (updates balance calculations)
 */
export async function createBankTransaction(
  bankAccountId: string,
  data: Omit<
    Prisma.BankTransactionCreateInput,
    | "bankAccount"
    | "user"
    | "totalDeposit"
    | "totalWithdrawal"
    | "currentBalance"
  >,
  userId: string
): Promise<BankTransaction> {
  try {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    // Get all existing transactions to calculate totals
    const existingTransactions = await prisma.bankTransaction.findMany({
      where: { bankAccountId },
      orderBy: { transactionDate: "asc" },
    });

    const startingBalance = Number(bankAccount.startingBalance);
    const existingCredits = existingTransactions
      .filter((t) => t.transactionType === "CREDIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const existingDebits = existingTransactions
      .filter((t) => t.transactionType === "DEBIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const transactionAmount = Number(data.amount);
    const isCredit = data.transactionType === "CREDIT";

    const totalDeposit = isCredit
      ? existingCredits + transactionAmount
      : existingCredits;
    const totalWithdrawal = isCredit
      ? existingDebits
      : existingDebits + transactionAmount;
    const currentBalance = startingBalance + totalDeposit - totalWithdrawal;

    // Create transaction with calculated values
    const transaction = await prisma.bankTransaction.create({
      data: {
        ...data,
        totalDeposit,
        totalWithdrawal,
        currentBalance,
        bankAccount: {
          connect: { id: bankAccountId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    return {
      ...transaction,
      amount: Number(transaction.amount),
      totalDeposit: Number(transaction.totalDeposit),
      totalWithdrawal: Number(transaction.totalWithdrawal),
      currentBalance: Number(transaction.currentBalance),
    };
  } catch (error) {
    console.error("Error creating bank transaction:", error);
    throw new Error("Failed to create bank transaction");
  }
}

/**
 * Update a bank transaction (recalculates balance)
 */
export async function updateBankTransaction(
  transactionId: string,
  data: Partial<
    Omit<Prisma.BankTransactionUpdateInput, "bankAccount" | "user">
  >,
  userId: string
): Promise<BankTransaction> {
  try {
    // Verify ownership
    const existing = await prisma.bankTransaction.findFirst({
      where: { id: transactionId, userId },
      include: { bankAccount: true },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    const transaction = await prisma.bankTransaction.update({
      where: { id: transactionId },
      data,
    });

    // Recalculate all transactions for this account
    await recalculateBankAccountBalance(existing.bankAccountId, userId);

    // Fetch updated transaction
    const updated = await prisma.bankTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!updated) {
      throw new Error("Failed to fetch updated transaction");
    }

    return {
      ...updated,
      amount: Number(updated.amount),
      totalDeposit: Number(updated.totalDeposit),
      totalWithdrawal: Number(updated.totalWithdrawal),
      currentBalance: Number(updated.currentBalance),
    };
  } catch (error) {
    console.error("Error updating bank transaction:", error);
    throw new Error("Failed to update bank transaction");
  }
}

/**
 * Delete a bank transaction (recalculates balance)
 */
export async function deleteBankTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.bankTransaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    const bankAccountId = existing.bankAccountId;

    await prisma.bankTransaction.delete({
      where: { id: transactionId },
    });

    // Recalculate all transactions for this account
    await recalculateBankAccountBalance(bankAccountId, userId);
  } catch (error) {
    console.error("Error deleting bank transaction:", error);
    throw new Error("Failed to delete bank transaction");
  }
}

/**
 * Recalculate balance for all transactions in a bank account
 */
async function recalculateBankAccountBalance(
  bankAccountId: string,
  userId: string
): Promise<void> {
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id: bankAccountId, userId },
  });

  if (!bankAccount) {
    throw new Error("Bank account not found");
  }

  const transactions = await prisma.bankTransaction.findMany({
    where: { bankAccountId },
    orderBy: { transactionDate: "asc" },
  });

  const startingBalance = Number(bankAccount.startingBalance);
  let runningBalance = startingBalance;
  let totalDeposit = 0;
  let totalWithdrawal = 0;

  // Update each transaction with recalculated values
  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    const isCredit = transaction.transactionType === "CREDIT";

    if (isCredit) {
      totalDeposit += amount;
      runningBalance += amount;
    } else {
      totalWithdrawal += amount;
      runningBalance -= amount;
    }

    await prisma.bankTransaction.update({
      where: { id: transaction.id },
      data: {
        totalDeposit,
        totalWithdrawal,
        currentBalance: runningBalance,
      },
    });
  }
}

// ============================================
// BANK CARD FUNCTIONS
// ============================================

/**
 * Get all cards for a bank account
 */
export async function getBankCards(
  bankAccountId: string,
  userId: string
): Promise<BankCard[]> {
  try {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    const cards = await prisma.bankCard.findMany({
      where: {
        bankAccountId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return cards.map((card) => ({
      ...card,
      limit: card.limit ? Number(card.limit) : null,
      lastBillAmount: card.lastBillAmount ? Number(card.lastBillAmount) : null,
      paymentAmount: card.paymentAmount ? Number(card.paymentAmount) : null,
    }));
  } catch (error) {
    console.error("Error fetching bank cards:", error);
    throw new Error("Failed to fetch bank cards");
  }
}

/**
 * Create a new bank card
 */
export async function createBankCard(
  bankAccountId: string,
  data: Omit<Prisma.bankCardCreateInput, "bankAccount" | "user">,
  userId: string
): Promise<BankCard> {
  try {
    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    const card = await prisma.bankCard.create({
      data: {
        ...data,
        bankAccount: {
          connect: { id: bankAccountId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    return {
      ...card,
      limit: card.limit ? Number(card.limit) : null,
      lastBillAmount: card.lastBillAmount ? Number(card.lastBillAmount) : null,
      paymentAmount: card.paymentAmount ? Number(card.paymentAmount) : null,
    };
  } catch (error) {
    console.error("Error creating bank card:", error);
    throw new Error("Failed to create bank card");
  }
}

/**
 * Update a bank card
 */
export async function updateBankCard(
  cardId: string,
  data: Partial<Omit<Prisma.bankCardUpdateInput, "bankAccount" | "user">>,
  userId: string
): Promise<BankCard> {
  try {
    // Verify ownership
    const existing = await prisma.bankCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!existing) {
      throw new Error("Bank card not found");
    }

    const card = await prisma.bankCard.update({
      where: { id: cardId },
      data,
    });

    return {
      ...card,
      limit: card.limit ? Number(card.limit) : null,
      lastBillAmount: card.lastBillAmount ? Number(card.lastBillAmount) : null,
      paymentAmount: card.paymentAmount ? Number(card.paymentAmount) : null,
    };
  } catch (error) {
    console.error("Error updating bank card:", error);
    throw new Error("Failed to update bank card");
  }
}

/**
 * Delete a bank card
 */
export async function deleteBankCard(
  cardId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.bankCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!existing) {
      throw new Error("Bank card not found");
    }

    await prisma.bankCard.delete({
      where: { id: cardId },
    });
  } catch (error) {
    console.error("Error deleting bank card:", error);
    throw new Error("Failed to delete bank card");
  }
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

/**
 * Get all categories for a user
 */
export async function getCategories(userId: string): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      include: {
        subCategories: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  data: Omit<
    Prisma.CategoryCreateInput,
    "user" | "subCategories" | "transactions"
  >,
  userId: string
): Promise<Category> {
  try {
    const category = await prisma.category.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<
    Omit<Prisma.CategoryUpdateInput, "user" | "subCategories" | "transactions">
  >,
  userId: string
): Promise<Category> {
  try {
    // Verify ownership
    const existing = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!existing) {
      throw new Error("Category not found");
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}

/**
 * Delete a category (cascade deletes all subcategories)
 */
export async function deleteCategory(
  categoryId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!existing) {
      throw new Error("Category not found");
    }

    // Delete all subcategories first (cascade delete)
    await prisma.subCategory.deleteMany({
      where: {
        categoryId,
        userId, // Only delete subcategories owned by the user
      },
    });

    // Now delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        throw new Error(
          "Cannot delete category: it is referenced by transactions"
        );
      }
    }

    throw new Error(
      `Failed to delete category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// ============================================
// SUBCATEGORY FUNCTIONS
// ============================================

/**
 * Get all subcategories for a category
 */
export async function getSubCategories(
  categoryId: string,
  userId?: string
): Promise<SubCategory[]> {
  try {
    const where: Prisma.SubCategoryWhereInput = { categoryId };
    if (userId) {
      where.userId = userId;
    }

    const subCategories = await prisma.subCategory.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return subCategories;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw new Error("Failed to fetch subcategories");
  }
}

/**
 * Create a new subcategory
 */
export async function createSubCategory(
  data: Omit<
    Prisma.SubCategoryCreateInput,
    "category" | "user" | "transactions"
  >,
  userId: string
): Promise<SubCategory> {
  try {
    // Extract categoryId from data to avoid conflict with relation
    const { categoryId, ...restData } = data as any;

    const subCategory = await prisma.subCategory.create({
      data: {
        ...restData,
        categoryId, // Set categoryId directly (required field)
        userId, // Set userId directly (optional field)
      },
    });

    return subCategory;
  } catch (error) {
    console.error("Error creating subcategory:", error);

    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error(
          "A subcategory with this name already exists for this category"
        );
      }
      if (error.code === "P2003") {
        throw new Error("Invalid category reference");
      }
    }

    // Pass through the actual error message for better debugging
    throw new Error(
      `Failed to create subcategory: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Update a subcategory
 */
export async function updateSubCategory(
  subCategoryId: string,
  data: Partial<
    Omit<Prisma.SubCategoryUpdateInput, "category" | "user" | "transactions">
  >,
  userId: string
): Promise<SubCategory> {
  try {
    // Verify ownership
    const existing = await prisma.subCategory.findFirst({
      where: { id: subCategoryId, userId },
    });

    if (!existing) {
      throw new Error("Subcategory not found");
    }

    const subCategory = await prisma.subCategory.update({
      where: { id: subCategoryId },
      data,
    });

    return subCategory;
  } catch (error) {
    console.error("Error updating subcategory:", error);
    throw new Error("Failed to update subcategory");
  }
}

/**
 * Delete a subcategory
 */
export async function deleteSubCategory(
  subCategoryId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.subCategory.findFirst({
      where: { id: subCategoryId, userId },
    });

    if (!existing) {
      throw new Error("Subcategory not found");
    }

    await prisma.subCategory.delete({
      where: { id: subCategoryId },
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    throw new Error("Failed to delete subcategory");
  }
}

// ============================================
// TRANSACTION FUNCTIONS (separate from BankTransaction)
// ============================================

/**
 * Get all transactions for a user
 */
export async function getTransactions(
  userId: string,
  filters?: {
    bankAccountId?: string;
    categoryId?: string;
    subCategoryId?: string;
    transactionType?: "CREDIT" | "DEBIT";
    paymentMethod?: "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER";
    status?: "PENDING" | "COMPLETED" | "FAILED";
    startDate?: Date | string;
    endDate?: Date | string;
    skip?: number;
    take?: number;
  }
): Promise<{ transactions: Transaction[]; total: number }> {
  try {
    const where: Prisma.TransactionWhereInput = {
      userId,
      isActive: true, // Only fetch active transactions by default
    };

    if (filters?.bankAccountId) {
      where.bankAccountId = filters.bankAccountId;
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.subCategoryId) {
      where.subCategoryId = filters.subCategoryId;
    }
    if (filters?.transactionType) {
      where.transactionType = filters.transactionType;
    }
    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    // Get total count for pagination
    const total = await prisma.transaction.count({ where });

    // Fetch transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        subCategory: true,
        bankAccount: true,
      },
      orderBy: {
        date: "desc",
      },
      skip: filters?.skip,
      take: filters?.take,
    });

    return {
      transactions: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        bankAccount: t.bankAccount
          ? {
              ...t.bankAccount,
              startingBalance: t.bankAccount.startingBalance
                ? Number(t.bankAccount.startingBalance)
                : 0, // default starting balance is 0
              insuranceAmount: t.bankAccount.insuranceAmount
                ? Number(t.bankAccount.insuranceAmount)
                : null,
            }
          : null,
      })),
      total,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

/**
 * Get a single transaction by ID with relations
 */
export async function getTransaction(
  transactionId: string,
  userId: string
): Promise<Transaction | null> {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: true,
        subCategory: true,
        bankAccount: true,
      },
    });

    if (!transaction) {
      return null;
    }

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw new Error("Failed to fetch transaction");
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  data: Omit<Prisma.TransactionUncheckedCreateInput, "userId">,
  userId: string
): Promise<Transaction> {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
      include: {
        category: true,
        subCategory: true,
        bankAccount: true,
      },
    });

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction");
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  transactionId: string,
  data: Partial<
    Omit<
      Prisma.TransactionUpdateInput,
      "user" | "bankAccount" | "category" | "subCategory"
    >
  >,
  userId: string
): Promise<Transaction> {
  try {
    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data,
      include: {
        category: true,
        subCategory: true,
        bankAccount: true,
      },
    });

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw new Error("Failed to update transaction");
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  }
}
