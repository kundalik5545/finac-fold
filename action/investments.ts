"use server";

import prisma from "@/lib/prisma";
import {
  Investment,
  InvestmentTransaction,
  InvestmentPriceHistory,
  InvestmentType,
  InvestmentStats,
  AllInvestmentStats,
} from "@/lib/types/investments-types";
import { Prisma } from "@/app/generated/prisma/client";
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateInvestmentStatsByType,
  calculateAllInvestmentStats,
  supportsPriceFetching,
} from "@/lib/utils/investment-utils";
import { fetchInvestmentPrice } from "@/lib/utils/alpha-vantage";
import { createTransaction } from "./bank-account";

// ============================================
// INVESTMENT FUNCTIONS
// ============================================

/**
 * Fetch all investments for a user (optionally filtered by type)
 */
export async function getInvestments(
  userId: string,
  type?: InvestmentType
): Promise<Investment[]> {
  try {
    const where: Prisma.InvestmentWhereInput = {
      userId,
    };

    if (type) {
      where.type = type;
    }

    const investments = await prisma.investment.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        investmentTransactions: true,
      },
    });

    return investments.map((investment) => ({
      ...investment,
      type: investment.type as InvestmentType,
      currentPrice: Number(investment.currentPrice),
      investedAmount: Number(investment.investedAmount),
      currentValue: Number(investment.currentValue),
      quantity: Number(investment.quantity),
      investmentTransactions: investment.investmentTransactions.map((t) => ({
        ...t,
        transactionType: t.transactionType as any,
        amount: Number(t.amount),
      })),
    }));
  } catch (error) {
    console.error("Error fetching investments:", error);
    throw new Error("Failed to fetch investments");
  }
}

/**
 * Fetch a single investment with its transactions and price history
 */
export async function getInvestment(
  investmentId: string,
  userId: string
): Promise<
  Investment & {
    investmentTransactions: InvestmentTransaction[];
    investmentPriceHistory: InvestmentPriceHistory[];
  }
> {
  try {
    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId,
      },
      include: {
        investmentTransactions: {
          orderBy: {
            date: "desc",
          },
        },
        investmentPriceHistory: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!investment) {
      throw new Error("Investment not found");
    }

    return {
      ...investment,
      type: investment.type as InvestmentType,
      currentPrice: Number(investment.currentPrice),
      investedAmount: Number(investment.investedAmount),
      currentValue: Number(investment.currentValue),
      quantity: Number(investment.quantity),
      investmentTransactions: investment.investmentTransactions.map((t) => ({
        ...t,
        transactionType: t.transactionType as any,
        amount: Number(t.amount),
      })),
      investmentPriceHistory: investment.investmentPriceHistory.map((h) => ({
        ...h,
        source: h.source as any,
        price: Number(h.price),
      })),
    };
  } catch (error) {
    console.error("Error fetching investment:", error);
    throw new Error("Failed to fetch investment");
  }
}

/**
 * Create a new investment
 * Also creates initial price history entry and transaction entry
 */
export async function createInvestment(
  data: Omit<
    Prisma.InvestmentCreateInput,
    | "user"
    | "investmentTransactions"
    | "investmentPriceHistory"
    | "transactions"
  >,
  userId: string
): Promise<Investment> {
  try {
    const investedAmount = Number(data.investedAmount);
    const quantity = Number(data.quantity);
    const currentPrice = Number(data.currentPrice) || 0;
    const currentValue = currentPrice * quantity;

    // Create investment with initial price history
    const investment = await prisma.investment.create({
      data: {
        ...data,
        investedAmount,
        quantity,
        currentPrice,
        currentValue,
        user: {
          connect: { id: userId },
        },
        investmentPriceHistory: {
          create: {
            price: currentPrice,
            date: new Date(data.purchaseDate),
            source: "MANUAL",
            user: {
              connect: { id: userId },
            },
          },
        },
      },
    });

    // Create transaction entry in main Transaction table
    try {
      // Get or create INVESTMENT category
      let investmentCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: "Investment",
          type: "INVESTMENT",
        },
      });

      if (!investmentCategory) {
        investmentCategory = await prisma.category.create({
          data: {
            name: "Investment",
            type: "INVESTMENT",
            userId,
          },
        });
      }

      await createTransaction(
        {
          amount: investedAmount,
          transactionType: "DEBIT",
          status: "COMPLETED",
          date: new Date(data.purchaseDate),
          description: `Investment: ${data.name}`,
          currency: "INR",
          isActive: true,
          categoryId: investmentCategory.id,
          investmentId: investment.id,
        },
        userId
      );
    } catch (transactionError) {
      console.error("Error creating transaction entry:", transactionError);
      // Don't fail investment creation if transaction creation fails
    }

    return {
      ...investment,
      type: investment.type as InvestmentType,
      currentPrice: Number(investment.currentPrice),
      investedAmount: Number(investment.investedAmount),
      currentValue: Number(investment.currentValue),
      quantity: Number(investment.quantity),
    };
  } catch (error) {
    console.error("Error creating investment:", error);
    throw new Error(
      `Failed to create investment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Update an investment
 */
export async function updateInvestment(
  investmentId: string,
  data: Partial<
    Omit<
      Prisma.InvestmentUpdateInput,
      | "user"
      | "investmentTransactions"
      | "investmentPriceHistory"
      | "transactions"
    >
  >,
  userId: string
): Promise<Investment> {
  try {
    // Verify ownership
    const existing = await prisma.investment.findFirst({
      where: { id: investmentId, userId },
    });

    if (!existing) {
      throw new Error("Investment not found");
    }

    // Recalculate currentValue if price or quantity changes
    if (data.currentPrice !== undefined || data.quantity !== undefined) {
      const newPrice =
        data.currentPrice !== undefined
          ? Number(data.currentPrice)
          : Number(existing.currentPrice);
      const newQuantity =
        data.quantity !== undefined
          ? Number(data.quantity)
          : Number(existing.quantity);
      data.currentValue = newPrice * newQuantity;
    }

    const investment = await prisma.investment.update({
      where: { id: investmentId },
      data,
    });

    return {
      ...investment,
      type: investment.type as InvestmentType,
      currentPrice: Number(investment.currentPrice),
      investedAmount: Number(investment.investedAmount),
      currentValue: Number(investment.currentValue),
      quantity: Number(investment.quantity),
    };
  } catch (error) {
    console.error("Error updating investment:", error);
    throw new Error("Failed to update investment");
  }
}

/**
 * Delete an investment (cascade deletes transactions and price history)
 */
export async function deleteInvestment(
  investmentId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.investment.findFirst({
      where: { id: investmentId, userId },
    });

    if (!existing) {
      throw new Error("Investment not found");
    }

    await prisma.investment.delete({
      where: { id: investmentId },
    });
  } catch (error) {
    console.error("Error deleting investment:", error);
    throw new Error("Failed to delete investment");
  }
}

/**
 * Fetch latest prices for investments from Alpha Vantage API
 */
export async function fetchLatestPrices(
  investmentIds: string[],
  userId: string
): Promise<Investment[]> {
  try {
    const investments = await prisma.investment.findMany({
      where: {
        id: { in: investmentIds },
        userId,
      },
    });

    const updatedInvestments: Investment[] = [];

    for (const investment of investments) {
      // Only fetch prices for supported types
      const investmentType = investment.type as InvestmentType;
      if (!supportsPriceFetching(investmentType)) {
        continue;
      }

      try {
        const newPrice = await fetchInvestmentPrice(
          investmentType,
          investment.symbol || null
        );

        if (newPrice !== null && newPrice > 0) {
          // Create price history entry
          await prisma.investmentPriceHistory.create({
            data: {
              price: newPrice,
              date: new Date(),
              source: "API",
              investment: {
                connect: { id: investment.id },
              },
              user: {
                connect: { id: userId },
              },
            },
          });

          updatedInvestments.push({
            ...updated,
            type: updated.type as InvestmentType,
            currentPrice: Number(updated.currentPrice),
            investedAmount: Number(updated.investedAmount),
            currentValue: Number(updated.currentValue),
            quantity: Number(updated.quantity),
          });
        }
      } catch (error) {
        console.error(
          `Error fetching price for investment ${investment.id}:`,
          error
        );
        // Continue with other investments even if one fails
      }
    }

    return updatedInvestments;
  } catch (error) {
    console.error("Error fetching latest prices:", error);
    throw new Error("Failed to fetch latest prices");
  }
}

/**
 * Calculate investment stats (optionally filtered by type)
 */
export async function getInvestmentStats(
  userId: string,
  type?: InvestmentType
): Promise<InvestmentStats | AllInvestmentStats> {
  try {
    const investments = await getInvestments(userId, type);

    if (type) {
      return calculateInvestmentStatsByType(investments, type);
    } else {
      return calculateAllInvestmentStats(investments);
    }
  } catch (error) {
    console.error("Error calculating investment stats:", error);
    throw new Error("Failed to calculate investment stats");
  }
}

// ============================================
// INVESTMENT TRANSACTION FUNCTIONS
// ============================================

/**
 * Get all transactions for an investment
 */
export async function getInvestmentTransactions(
  investmentId: string,
  userId: string
): Promise<InvestmentTransaction[]> {
  try {
    // Verify investment ownership
    const investment = await prisma.investment.findFirst({
      where: { id: investmentId, userId },
    });

    if (!investment) {
      throw new Error("Investment not found");
    }

    const transactions = await prisma.investmentTransaction.findMany({
      where: {
        investmentId,
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return transactions.map((t) => ({
      ...t,
      transactionType: t.transactionType as any,
      amount: Number(t.amount),
    }));
  } catch (error) {
    console.error("Error fetching investment transactions:", error);
    throw new Error("Failed to fetch investment transactions");
  }
}

/**
 * Create a new investment transaction
 * Updates investment investedAmount and currentValue
 * Also creates entry in main Transaction table
 */
export async function createInvestmentTransaction(
  investmentId: string,
  data: Omit<Prisma.InvestmentTransactionCreateInput, "investment" | "user">,
  userId: string
): Promise<InvestmentTransaction> {
  try {
    // Verify investment ownership
    const investment = await prisma.investment.findFirst({
      where: { id: investmentId, userId },
    });

    if (!investment) {
      throw new Error("Investment not found");
    }

    const transactionAmount = Number(data.amount);
    const isInvest = data.transactionType === "INVEST";

    // Calculate new invested amount and current value
    const currentInvestedAmount = Number(investment.investedAmount);
    const currentValue = Number(investment.currentValue);
    const currentPrice = Number(investment.currentPrice);

    let newInvestedAmount: number;
    let newCurrentValue: number;

    if (isInvest) {
      newInvestedAmount = currentInvestedAmount + transactionAmount;
      // For manual investments (FD, NPS, PF), increase current value proportionally
      if (currentInvestedAmount > 0) {
        const ratio = newInvestedAmount / currentInvestedAmount;
        newCurrentValue = currentValue * ratio;
      } else {
        newCurrentValue = transactionAmount; // First investment
      }
    } else {
      newInvestedAmount = Math.max(
        0,
        currentInvestedAmount - transactionAmount
      );
      // For withdrawals, decrease current value proportionally
      if (currentInvestedAmount > 0) {
        const ratio = newInvestedAmount / currentInvestedAmount;
        newCurrentValue = currentValue * ratio;
      } else {
        newCurrentValue = 0;
      }
    }

    // Create transaction and update investment in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.investmentTransaction.create({
        data: {
          ...data,
          investment: {
            connect: { id: investmentId },
          },
          user: {
            connect: { id: userId },
          },
        },
      }),
      prisma.investment.update({
        where: { id: investmentId },
        data: {
          investedAmount: newInvestedAmount,
          currentValue: newCurrentValue,
          // Update price if needed (for manual investments)
          ...(currentPrice === 0 &&
            newInvestedAmount > 0 && {
              currentPrice: newCurrentValue / Number(investment.quantity),
            }),
        },
      }),
    ]);

    // Create price history entry for manual updates
    await prisma.investmentPriceHistory.create({
      data: {
        price:
          newInvestedAmount > 0
            ? newCurrentValue / Number(investment.quantity)
            : 0,
        date: new Date(data.date),
        source: "MANUAL",
        investment: {
          connect: { id: investmentId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    // Create transaction entry in main Transaction table
    try {
      // Get or create INVESTMENT category
      let investmentCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: "Investment",
          type: "INVESTMENT",
        },
      });

      if (!investmentCategory) {
        investmentCategory = await prisma.category.create({
          data: {
            name: "Investment",
            type: "INVESTMENT",
            userId,
          },
        });
      }

      await createTransaction(
        {
          amount: transactionAmount,
          transactionType: isInvest ? "DEBIT" : "CREDIT",
          status: "COMPLETED",
          date: new Date(data.date),
          description: `${isInvest ? "Investment" : "Withdrawal"}: ${
            investment.name
          }${data.notes ? ` - ${data.notes}` : ""}`,
          currency: "INR",
          isActive: true,
          categoryId: investmentCategory.id,
          investmentId: investment.id,
        },
        userId
      );
    } catch (transactionError) {
      console.error("Error creating transaction entry:", transactionError);
      // Don't fail investment transaction creation if transaction creation fails
    }

    return {
      ...transaction,
      transactionType: transaction.transactionType as any,
      amount: Number(transaction.amount),
    };
  } catch (error) {
    console.error("Error creating investment transaction:", error);
    throw new Error("Failed to create investment transaction");
  }
}

/**
 * Update an investment transaction
 */
export async function updateInvestmentTransaction(
  transactionId: string,
  data: Partial<
    Omit<Prisma.InvestmentTransactionUpdateInput, "investment" | "user">
  >,
  userId: string
): Promise<InvestmentTransaction> {
  try {
    // Verify ownership
    const existing = await prisma.investmentTransaction.findFirst({
      where: { id: transactionId, userId },
      include: { investment: true },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    const transaction = await prisma.investmentTransaction.update({
      where: { id: transactionId },
      data,
    });

    // Recalculate investment amounts based on all transactions
    const allTransactions = await prisma.investmentTransaction.findMany({
      where: { investmentId: existing.investmentId },
    });

    let totalInvested = 0;
    allTransactions.forEach((t) => {
      if (t.transactionType === "INVEST") {
        totalInvested += Number(t.amount);
      } else {
        totalInvested = Math.max(0, totalInvested - Number(t.amount));
      }
    });

    const investment = await prisma.investment.findFirst({
      where: { id: existing.investmentId },
    });

    if (investment) {
      const currentPrice = Number(investment.currentPrice);
      const quantity = Number(investment.quantity);
      const newCurrentValue =
        currentPrice > 0 ? currentPrice * quantity : totalInvested;

      await prisma.investment.update({
        where: { id: existing.investmentId },
        data: {
          investedAmount: totalInvested,
          currentValue: newCurrentValue,
        },
      });
    }

    return {
      ...transaction,
      transactionType: transaction.transactionType as any,
      amount: Number(transaction.amount),
    };
  } catch (error) {
    console.error("Error updating investment transaction:", error);
    throw new Error("Failed to update investment transaction");
  }
}

/**
 * Delete an investment transaction
 */
export async function deleteInvestmentTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.investmentTransaction.findFirst({
      where: { id: transactionId, userId },
      include: { investment: true },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    await prisma.investmentTransaction.delete({
      where: { id: transactionId },
    });

    // Recalculate investment amounts based on remaining transactions
    const remainingTransactions = await prisma.investmentTransaction.findMany({
      where: { investmentId: existing.investmentId },
    });

    let totalInvested = 0;
    remainingTransactions.forEach((t) => {
      if (t.transactionType === "INVEST") {
        totalInvested += Number(t.amount);
      } else {
        totalInvested = Math.max(0, totalInvested - Number(t.amount));
      }
    });

    const investment = await prisma.investment.findFirst({
      where: { id: existing.investmentId },
    });

    if (investment) {
      const currentPrice = Number(investment.currentPrice);
      const quantity = Number(investment.quantity);
      const newCurrentValue =
        currentPrice > 0 ? currentPrice * quantity : totalInvested;

      await prisma.investment.update({
        where: { id: existing.investmentId },
        data: {
          investedAmount: totalInvested,
          currentValue: newCurrentValue,
        },
      });
    }
  } catch (error) {
    console.error("Error deleting investment transaction:", error);
    throw new Error("Failed to delete investment transaction");
  }
}
