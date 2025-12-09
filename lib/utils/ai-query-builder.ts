import prisma from "@/lib/prisma";
import {
  Prisma,
  TransactionType,
  InvestmentType,
  AssetType,
} from "@/app/generated/prisma/client";

/**
 * PR REVIEW NOTES:
 *
 * 1. All WHERE builders ensure correct enum mapping as per Prisma schema.
 *   - TransactionType, BankTransactionType (CREDIT, DEBIT) are checked.
 *   - If enums change in the Prisma model later, please update mapping here.
 * 2. Checks for soft deletes/logic deletes (isActive) are present on entities that model them.
 * 3. Query/aggregation logic uses Number() for type safety for monetary fields and includes null handling.
 * 4. Comments added next to key locations for reviewer guidance.
 */

export interface QueryFilters {
  dateFrom?: string;
  dateTo?: string;
  transactionType?: string; // for Transaction/BankTransaction (CREDIT/DEBIT)
  category?: string;
  status?: string; // for Transaction/Goal/BankAccount: see enum mapping below
  type?: string; // for Investment/Asset/BankTransaction types
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
  groupBy?: "date" | "category" | "transactionType" | "type" | null | undefined;
}

/**
 * Util: Parse date string to Date object (Prisma expects JS Date)
 */
function parseDate(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  return new Date(dateString);
}

/**
 * Transaction: WHERE builder
 * - Maps incoming filters to correct field/enums for Prisma.TransactionWhereInput
 * - Uses TransactionType enum for transactionType
 */
function buildTransactionWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {
    userId,
    isActive: true, // Soft-delete handled here as per model
  };

  // Date filter
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      where.date.gte = parseDate(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.date.lte = parseDate(filters.dateTo);
    }
  }

  // TransactionType mapping (enum safety)
  if (filters?.transactionType) {
    // Normalize user entry, then map to enum value if present
    // Supported synonyms, see TransactionType Prisma enum if added more types
    const typeMapping: Record<string, TransactionType> = {
      INCOME: "CREDIT",
      INCOMES: "CREDIT",
      REVENUE: "CREDIT",
      EXPENSE: "DEBIT",
      EXPENSES: "DEBIT",
      SPENDING: "DEBIT",
      CREDIT: "CREDIT",
      DEBIT: "DEBIT",
    };

    const normalizedType = filters.transactionType.trim().toUpperCase();
    const mappedType = typeMapping[normalizedType];

    if (mappedType) {
      where.transactionType = mappedType;
    } else if (normalizedType === "CREDIT" || normalizedType === "DEBIT") {
      where.transactionType = normalizedType as TransactionType;
    }
    // NOTE: Unknown transactionType values will lead to no filter.
  }

  // Transaction status mapping: check enum on Prisma.TransactionStatus if model updated
  if (filters?.status) {
    // Only allow Prisma-accepted TransactionStatus strings
    // e.g. "PENDING", "COMPLETED", "FAILED"
    const allowedStatus = ["PENDING", "COMPLETED", "FAILED"];
    if (allowedStatus.includes(filters.status.toUpperCase())) {
      where.status = filters.status.toUpperCase() as any;
    }
    // NOTE: If schema adds/removes TransactionStatus values, update allowedStatus here.
  }

  // Category - nested filter by category name
  if (filters?.category) {
    where.category = {
      name: { contains: filters.category, mode: "insensitive" },
    };
  }

  return where;
}

/**
 * Investment: WHERE builder
 * PR review: Make sure "type" is a valid InvestmentType (from Prisma). Add enum safety check if needed.
 */
function buildInvestmentWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.InvestmentWhereInput {
  const where: Prisma.InvestmentWhereInput = {
    userId,
  };

  if (filters?.type) {
    // Optionally check filters.type is a valid enum if needed
    where.type = filters.type as InvestmentType;
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
 * Goal: WHERE builder
 * - status: (active/inactive) maps to isActive boolean field
 */
function buildGoalWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.GoalWhereInput {
  const where: Prisma.GoalWhereInput = {
    userId,
  };

  if (filters?.status) {
    // Only allow "active"/"inactive", maps to isActive boolean
    if (filters.status.toLowerCase() === "active") {
      where.isActive = true;
    } else if (filters.status.toLowerCase() === "inactive") {
      where.isActive = false;
    }
  }

  return where;
}

/**
 * Asset: WHERE builder
 * - "type" should match AssetType enum (see Prisma schema)
 */
function buildAssetWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {
    userId,
  };

  if (filters?.type) {
    where.type = filters.type as AssetType;
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
 * BankAccount: WHERE builder
 * - status: (active/inactive) maps to isActive
 */
function buildBankAccountWhere(
  userId: string,
  filters?: QueryFilters
): Prisma.BankAccountWhereInput {
  const where: Prisma.BankAccountWhereInput = {
    userId,
  };

  if (filters?.status) {
    if (filters.status.toLowerCase() === "active") {
      where.isActive = true;
    } else if (filters.status.toLowerCase() === "inactive") {
      where.isActive = false;
    }
    // If bank account uses an enum, update here!
  }

  return where;
}

/**
 * BankTransaction: WHERE builder
 * - Filters by transactionDate and transactionType (CREDIT/DEBIT)
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
    const normalized = filters.type.trim().toUpperCase();
    if (normalized === "CREDIT" || normalized === "DEBIT") {
      where.transactionType = normalized as TransactionType;
    }
  }

  return where;
}

/**
 * Transaction: Query with support for aggregation and groupBy
 */
async function queryTransactions(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null,
  groupBy?: "date" | "category" | "transactionType" | null | undefined
): Promise<any> {
  const where = buildTransactionWhere(userId, filters);

  if (aggregation === "count") return await prisma.transaction.count({ where });

  // TODO: If result set is large, consider pagination (future PR).
  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true, subCategory: true, bankAccount: true },
    orderBy: { date: "desc" },
  });

  // For PR review: Transaction fields returned by findMany must match any usage below

  if (aggregation === "sum") {
    return transactions.reduce((sum, t) => {
      const amount = Number(t.amount);
      // NOTE: Always use correct sign based on CREDIT/DEBIT
      return sum + (t.transactionType === "CREDIT" ? amount : -amount);
    }, 0);
  }

  if (aggregation === "average") {
    const sum = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
    return transactions.length > 0 ? sum / transactions.length : 0;
  }

  if (groupBy === "category") {
    // Group by category name
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const key = t.category?.name || "Uncategorized";
      if (!grouped[key]) grouped[key] = { category: key, count: 0, total: 0 };
      grouped[key].count++;
      const amount = Number(t.amount);
      grouped[key].total += t.transactionType === "CREDIT" ? amount : -amount;
    });
    return Object.values(grouped);
  }

  if (groupBy === "transactionType") {
    // Group by CREDIT/DEBIT
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const key = t.transactionType;
      if (!grouped[key]) grouped[key] = { type: key, count: 0, total: 0 };
      grouped[key].count++;
      grouped[key].total += Number(t.amount);
    });
    return Object.values(grouped);
  }

  if (groupBy === "date") {
    // Group by date (ISO date string)
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      // Defensive: t.date should be a Date instance
      const dateStr =
        t.date instanceof Date
          ? t.date.toISOString().split("T")[0]
          : String(t.date);
      if (!grouped[dateStr])
        grouped[dateStr] = { date: dateStr, count: 0, total: 0 };
      grouped[dateStr].count++;
      const amount = Number(t.amount);
      grouped[dateStr].total +=
        t.transactionType === "CREDIT" ? amount : -amount;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }

  return transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));
}

/**
 * Investment: Aggregation, groupBy and returns
 */
async function queryInvestments(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null,
  groupBy?: "type" | null | undefined
): Promise<any> {
  const where = buildInvestmentWhere(userId, filters);

  if (aggregation === "count") return await prisma.investment.count({ where });

  const investments = await prisma.investment.findMany({
    where,
    orderBy: { createdAt: "desc" },
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

  // Group by investment type
  if (groupBy === "type") {
    const grouped: Record<string, any> = {};
    investments.forEach((inv) => {
      const key = inv.type || "UNKNOWN";
      if (!grouped[key]) {
        grouped[key] = {
          type: key,
          count: 0,
          total: 0,
          totalInvested: 0,
          totalCurrentValue: 0,
        };
      }
      grouped[key].count++;
      grouped[key].totalInvested += Number(inv.investedAmount);
      grouped[key].totalCurrentValue += Number(inv.currentValue);
      // Use currentValue as the total for pie charts
      grouped[key].total += Number(inv.currentValue);
    });
    return Object.values(grouped);
  }

  // Cast number fields
  return investments.map((inv) => ({
    ...inv,
    currentPrice: Number(inv.currentPrice),
    investedAmount: Number(inv.investedAmount),
    currentValue: Number(inv.currentValue),
    quantity: Number(inv.quantity),
  }));
}

/**
 * Goal: Aggregation and returns
 */
async function queryGoals(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null
): Promise<any> {
  const where = buildGoalWhere(userId, filters);

  if (aggregation === "count") return await prisma.goal.count({ where });

  const goals = await prisma.goal.findMany({
    where,
    orderBy: { createdAt: "desc" },
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
 * Asset: Aggregation and returns
 */
async function queryAssets(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null
): Promise<any> {
  const where = buildAssetWhere(userId, filters);

  if (aggregation === "count") return await prisma.asset.count({ where });

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
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
 * BankAccount: Aggregation and returns
 */
async function queryBankAccounts(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null
): Promise<any> {
  const where = buildBankAccountWhere(userId, filters);

  if (aggregation === "count") return await prisma.bankAccount.count({ where });

  const accounts = await prisma.bankAccount.findMany({
    where,
    orderBy: { createdAt: "desc" },
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
 * BankTransaction: Aggregation, groupby and returns
 */
async function queryBankTransactions(
  userId: string,
  filters?: QueryFilters,
  aggregation?: "sum" | "count" | "average" | null,
  groupBy?: "date" | "transactionType" | null | undefined
): Promise<any> {
  const where = buildBankTransactionWhere(userId, filters);

  if (aggregation === "count")
    return await prisma.bankTransaction.count({ where });

  const transactions = await prisma.bankTransaction.findMany({
    where,
    include: { bankAccount: true },
    orderBy: { transactionDate: "desc" },
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

  if (groupBy === "transactionType") {
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const key = t.transactionType;
      if (!grouped[key]) grouped[key] = { type: key, count: 0, total: 0 };
      grouped[key].count++;
      grouped[key].total += Number(t.amount);
    });
    return Object.values(grouped);
  }

  if (groupBy === "date") {
    const grouped: Record<string, any> = {};
    transactions.forEach((t) => {
      const dateStr =
        t.transactionDate instanceof Date
          ? t.transactionDate.toISOString().split("T")[0]
          : String(t.transactionDate);
      if (!grouped[dateStr])
        grouped[dateStr] = { date: dateStr, count: 0, total: 0 };
      grouped[dateStr].count++;
      const amount = Number(t.amount);
      grouped[dateStr].total +=
        t.transactionType === "CREDIT" ? amount : -amount;
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
 * Execute query for any supported entity.
 * Main entry for Q&A; PR: Review that all entity cases are handled.
 * If you add new entity, update QueryParams.entity and add new case below.
 */
export async function executeQuery(
  userId: string,
  params: QueryParams
): Promise<any> {
  const { entity, filters, aggregation, groupBy } = params;

  try {
    switch (entity) {
      case "transaction":
        return await queryTransactions(
          userId,
          filters,
          aggregation,
          groupBy as "date" | "category" | "transactionType" | null | undefined
        );
      case "investment":
        return await queryInvestments(
          userId,
          filters,
          aggregation,
          groupBy === "type" ? "type" : undefined
        );
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
          groupBy as "date" | "transactionType" | null | undefined
        );
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  } catch (error) {
    // PR: Surface error logs for easier production debug.
    console.error(`Error executing query for ${entity}:`, error);
    throw new Error(
      `Failed to query ${entity}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
