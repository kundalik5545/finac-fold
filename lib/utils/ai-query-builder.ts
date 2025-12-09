import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export interface QueryFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}

export interface QueryParams {
  entity:
    | "transaction"
    | "investment"
    | "goal"
    | "asset"
    | "bankAccount"
    | "bankTransaction";
  filters?: QueryFilters;
  aggregation?: "sum" | "count" | "average" | null;
  groupBy?: "date" | "category" | "type" | null | undefined;
}

/**
 * Parse date string to Date object
 */
function parseDate(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  return new Date(dateString);
}

/**
 * Build Prisma where clause for transactions
 */
function buildTransactionWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {
    userId,
    isActive: true,
  };

  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      where.date.gte = parseDate(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.date.lte = parseDate(filters.dateTo);
    }
  }

  if (filters?.type) {
    where.transactionType = filters.type as "CREDIT" | "DEBIT";
  }

  if (filters?.status) {
    where.status = filters.status as "PENDING" | "COMPLETED" | "FAILED";
  }

  if (filters?.category) {
    where.category = {
      name: { contains: filters.category, mode: "insensitive" },
    };
  }

  return where;
}

/**
 * Build Prisma where clause for investments
 */
function buildInvestmentWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.InvestmentWhereInput {
  const where: Prisma.InvestmentWhereInput = {
    userId,
  };

  if (filters?.type) {
    where.type = filters.type as any;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.purchaseDate = {};
    if (filters.dateFrom) {
      where.purchaseDate.gte = parseDate(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.purchaseDate.lte = parseDate(filters.dateTo);
    }
  }

  return where;
}

/**
 * Build Prisma where clause for goals
 */
function buildGoalWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.GoalWhereInput {
  const where: Prisma.GoalWhereInput = {
    userId,
  };

  if (filters?.status === "active" || filters?.status === "inactive") {
    where.isActive = filters.status === "active";
  }

  return where;
}

/**
 * Build Prisma where clause for assets
 */
function buildAssetWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {
    userId,
  };

  if (filters?.type) {
    where.type = filters.type as any;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.purchaseDate = {};
    if (filters.dateFrom) {
      where.purchaseDate.gte = parseDate(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.purchaseDate.lte = parseDate(filters.dateTo);
    }
  }

  return where;
}

/**
 * Build Prisma where clause for bank accounts
 */
function buildBankAccountWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.BankAccountWhereInput {
  const where: Prisma.BankAccountWhereInput = {
    userId,
  };

  if (filters?.status === "active" || filters?.status === "inactive") {
    where.isActive = filters.status === "active";
  }

  return where;
}

/**
 * Build Prisma where clause for bank transactions
 */
function buildBankTransactionWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.BankTransactionWhereInput {
  const where: Prisma.BankTransactionWhereInput = {
    userId,
  };

  if (filters?.dateFrom || filters?.dateTo) {
    where.transactionDate = {};
    if (filters.dateFrom) {
      where.transactionDate.gte = parseDate(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.transactionDate.lte = parseDate(filters.dateTo);
    }
  }

  if (filters?.type) {
    where.transactionType = filters.type as "CREDIT" | "DEBIT";
  }

  return where;
}

/**
 * Execute query for transactions
 */
async function queryTransactions(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null,
  groupBy?: "date" | "category" | "type" | null | undefined
): Promise<any> {
  const where = buildTransactionWhere(userId, filters);

  if (aggregation === "count") {
    return await prisma.transaction.count({ where });
  }

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
  });

  if (aggregation === "sum") {
    return transactions.reduce((sum, t) => {
      const amount = Number(t.amount);
      return sum + (t.transactionType === "CREDIT" ? amount : -amount);
    }, 0);
  }

  if (aggregation === "average") {
    const sum = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return transactions.length > 0 ? sum / transactions.length : 0;
  }

  if (groupBy === "category") {
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const key = t.category?.name || "Uncategorized";
      if (!grouped[key]) {
        grouped[key] = { category: key, count: 0, total: 0 };
      }
      grouped[key].count++;
      const amount = Number(t.amount);
      grouped[key].total += t.transactionType === "CREDIT" ? amount : -amount;
    });
    return Object.values(grouped);
  }

  if (groupBy === "type") {
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const key = t.transactionType;
      if (!grouped[key]) {
        grouped[key] = { type: key, count: 0, total: 0 };
      }
      grouped[key].count++;
      grouped[key].total += Number(t.amount);
    });
    return Object.values(grouped);
  }

  if (groupBy === "date") {
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const date = t.date.toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { date, count: 0, total: 0 };
      }
      grouped[date].count++;
      const amount = Number(t.amount);
      grouped[date].total += t.transactionType === "CREDIT" ? amount : -amount;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }

  return transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));
}

/**
 * Execute query for investments
 */
async function queryInvestments(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null
): Promise<any> {
  const where = buildInvestmentWhere(userId, filters);

  if (aggregation === "count") {
    return await prisma.investment.count({ where });
  }

  const investments = await prisma.investment.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (aggregation === "sum") {
    return investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0);
  }

  if (aggregation === "average") {
    const sum = investments.reduce(
      (sum, inv) => sum + Number(inv.currentValue),
      0
    );
    return investments.length > 0 ? sum / investments.length : 0;
  }

  return investments.map((inv) => ({
    ...inv,
    currentPrice: Number(inv.currentPrice),
    investedAmount: Number(inv.investedAmount),
    currentValue: Number(inv.currentValue),
    quantity: Number(inv.quantity),
  }));
}

/**
 * Execute query for goals
 */
async function queryGoals(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null
): Promise<any> {
  const where = buildGoalWhere(userId, filters);

  if (aggregation === "count") {
    return await prisma.goal.count({ where });
  }

  const goals = await prisma.goal.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (aggregation === "sum") {
    return goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  }

  if (aggregation === "average") {
    const sum = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    return goals.length > 0 ? sum / goals.length : 0;
  }

  return goals.map((g) => ({
    ...g,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
  }));
}

/**
 * Execute query for assets
 */
async function queryAssets(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null
): Promise<any> {
  const where = buildAssetWhere(userId, filters);

  if (aggregation === "count") {
    return await prisma.asset.count({ where });
  }

  const assets = await prisma.asset.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (aggregation === "sum") {
    return assets.reduce((sum, a) => sum + Number(a.currentValue), 0);
  }

  if (aggregation === "average") {
    const sum = assets.reduce((sum, a) => sum + Number(a.currentValue), 0);
    return assets.length > 0 ? sum / assets.length : 0;
  }

  return assets.map((a) => ({
    ...a,
    currentValue: Number(a.currentValue),
    purchaseValue: Number(a.purchaseValue),
    sellPrice: a.sellPrice ? Number(a.sellPrice) : null,
    profitLoss: a.profitLoss ? Number(a.profitLoss) : null,
  }));
}

/**
 * Execute query for bank accounts
 */
async function queryBankAccounts(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null
): Promise<any> {
  const where = buildBankAccountWhere(userId, filters);

  if (aggregation === "count") {
    return await prisma.bankAccount.count({ where });
  }

  const accounts = await prisma.bankAccount.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (aggregation === "sum") {
    return accounts.reduce((sum, acc) => sum + Number(acc.startingBalance), 0);
  }

  if (aggregation === "average") {
    const sum = accounts.reduce(
      (sum, acc) => sum + Number(acc.startingBalance),
      0
    );
    return accounts.length > 0 ? sum / accounts.length : 0;
  }

  return accounts.map((acc) => ({
    ...acc,
    startingBalance: Number(acc.startingBalance),
    insuranceAmount: acc.insuranceAmount ? Number(acc.insuranceAmount) : null,
  }));
}

/**
 * Execute query for bank transactions
 */
async function queryBankTransactions(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null,
  groupBy?: "date" | "type" | null | undefined
): Promise<any> {
  const where = buildBankTransactionWhere(userId, filters);

  if (aggregation === "count") {
    return await prisma.bankTransaction.count({ where });
  }

  const transactions = await prisma.bankTransaction.findMany({
    where,
    include: {
      bankAccount: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  if (aggregation === "sum") {
    return transactions.reduce((sum, t) => {
      const amount = Number(t.amount);
      return sum + (t.transactionType === "CREDIT" ? amount : -amount);
    }, 0);
  }

  if (aggregation === "average") {
    const sum = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return transactions.length > 0 ? sum / transactions.length : 0;
  }

  if (groupBy === "type") {
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const key = t.transactionType;
      if (!grouped[key]) {
        grouped[key] = { type: key, count: 0, total: 0 };
      }
      grouped[key].count++;
      grouped[key].total += Number(t.amount);
    });
    return Object.values(grouped);
  }

  if (groupBy === "date") {
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const date = t.transactionDate.toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { date, count: 0, total: 0 };
      }
      grouped[date].count++;
      const amount = Number(t.amount);
      grouped[date].total += t.transactionType === "CREDIT" ? amount : -amount;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }

  return transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    totalDeposit: Number(t.totalDeposit),
    totalWithdrawal: Number(t.totalWithdrawal),
    currentBalance: Number(t.currentBalance),
  }));
}

/**
 * Execute database query based on query parameters
 */
export async function executeQuery(
  userId: string,
  params: QueryParams
): Promise<any> {
  const { entity, filters, aggregation, groupBy } = params;

  try {
    switch (entity) {
      case "transaction":
        return await queryTransactions(userId, filters, aggregation, groupBy);
      case "investment":
        return await queryInvestments(userId, filters, aggregation);
      case "goal":
        return await queryGoals(userId, filters, aggregation);
      case "asset":
        return await queryAssets(userId, filters, aggregation);
      case "bankAccount":
        return await queryBankAccounts(userId, filters, aggregation);
      case "bankTransaction":
        return await queryBankTransactions(
          userId,
          filters,
          aggregation,
          groupBy as "date" | "type" | null | undefined
        );
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  } catch (error) {
    console.error(`Error executing query for ${entity}:`, error);
    throw new Error(
      `Failed to query ${entity}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
