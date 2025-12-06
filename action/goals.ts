"use server";

import prisma from "@/lib/prisma";
import { Goal, GoalTransaction } from "@/lib/goals-types";
import { Prisma } from "@/app/generated/prisma/client";

// ============================================
// GOAL FUNCTIONS
// ============================================

/**
 * Fetch all goals for a user with progress calculation
 */
export async function getGoals(userId: string): Promise<Goal[]> {
  try {
    const goals = await prisma.goal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return goals.map((goal) => ({
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
    }));
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw new Error("Failed to fetch goals");
  }
}

/**
 * Fetch a single goal with its transactions
 */
export async function getGoal(
  goalId: string,
  userId: string
): Promise<Goal & { goalTransactions: GoalTransaction[] }> {
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
      include: {
        goalTransactions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    return {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      goalTransactions: goal.goalTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
    };
  } catch (error) {
    console.error("Error fetching goal:", error);
    throw new Error("Failed to fetch goal");
  }
}

/**
 * Create a new goal (optionally creates initial transaction if currentAmount > 0)
 */
export async function createGoal(
  data: Omit<Prisma.GoalCreateInput, "user" | "goalTransactions">,
  userId: string
): Promise<Goal> {
  try {
    const currentAmount = Number(data.currentAmount) || 0;
    const targetAmount = Number(data.targetAmount);

    // Ensure currentAmount doesn't exceed targetAmount
    const cappedCurrentAmount = Math.min(currentAmount, targetAmount);

    // Explicitly construct the data object to avoid type issues
    const goalData: Prisma.GoalCreateInput = {
      name: data.name,
      targetAmount: targetAmount,
      currentAmount: cappedCurrentAmount,
      targetDate: data.targetDate,
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      isActive: data.isActive ?? true,
      user: {
        connect: { id: userId },
      },
      // Create initial transaction if currentAmount > 0
      ...(cappedCurrentAmount > 0 && {
        goalTransactions: {
          create: {
            amount: cappedCurrentAmount,
            date: new Date(),
            notes: "Initial amount",
            user: {
              connect: { id: userId },
            },
          },
        },
      }),
    };

    // Create goal
    const goal = await prisma.goal.create({
      data: goalData,
    });

    return {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
    };
  } catch (error) {
    console.error("Error creating goal:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    throw new Error(
      `Failed to create goal: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Update a goal
 */
export async function updateGoal(
  goalId: string,
  data: Partial<Omit<Prisma.GoalUpdateInput, "user" | "goalTransactions">>,
  userId: string
): Promise<Goal> {
  try {
    // Verify ownership
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) {
      throw new Error("Goal not found");
    }

    // If currentAmount is being updated, ensure it doesn't exceed targetAmount
    if (data.currentAmount !== undefined) {
      const targetAmount = data.targetAmount
        ? Number(data.targetAmount)
        : Number(existing.targetAmount);
      const currentAmount = Number(data.currentAmount);
      data.currentAmount = Math.min(currentAmount, targetAmount);
    }

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data,
    });

    return {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
    };
  } catch (error) {
    console.error("Error updating goal:", error);
    throw new Error("Failed to update goal");
  }
}

/**
 * Delete a goal (cascade deletes transactions)
 */
export async function deleteGoal(
  goalId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) {
      throw new Error("Goal not found");
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw new Error("Failed to delete goal");
  }
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

/**
 * Get all transactions for a goal
 */
export async function getGoalTransactions(
  goalId: string,
  userId: string
): Promise<GoalTransaction[]> {
  try {
    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    const transactions = await prisma.goalTransaction.findMany({
      where: {
        goalId,
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));
  } catch (error) {
    console.error("Error fetching goal transactions:", error);
    throw new Error("Failed to fetch goal transactions");
  }
}

/**
 * Create a new transaction (updates goal currentAmount)
 */
export async function createGoalTransaction(
  goalId: string,
  data: Omit<Prisma.GoalTransactionCreateInput, "goal" | "user">,
  userId: string
): Promise<GoalTransaction> {
  try {
    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    const transactionAmount = Number(data.amount);
    const currentAmount = Number(goal.currentAmount);
    const targetAmount = Number(goal.targetAmount);
    const newCurrentAmount = Math.min(
      currentAmount + transactionAmount,
      targetAmount
    );

    // Create transaction and update goal currentAmount in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.goalTransaction.create({
        data: {
          ...data,
          goal: {
            connect: { id: goalId },
          },
          user: {
            connect: { id: userId },
          },
        },
      }),
      prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrentAmount,
        },
      }),
    ]);

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  } catch (error) {
    console.error("Error creating goal transaction:", error);
    throw new Error("Failed to create goal transaction");
  }
}

/**
 * Update a transaction
 */
export async function updateGoalTransaction(
  transactionId: string,
  data: Partial<Omit<Prisma.GoalTransactionUpdateInput, "goal" | "user">>,
  userId: string
): Promise<GoalTransaction> {
  try {
    // Verify ownership
    const existing = await prisma.goalTransaction.findFirst({
      where: { id: transactionId, userId },
      include: { goal: true },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    const transaction = await prisma.goalTransaction.update({
      where: { id: transactionId },
      data,
    });

    // Recalculate goal's currentAmount based on all transactions
    const allTransactions = await prisma.goalTransaction.findMany({
      where: { goalId: existing.goalId },
    });

    const totalAmount = allTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const targetAmount = Number(existing.goal.targetAmount);
    const newCurrentAmount = Math.min(totalAmount, targetAmount);

    await prisma.goal.update({
      where: { id: existing.goalId },
      data: {
        currentAmount: newCurrentAmount,
      },
    });

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  } catch (error) {
    console.error("Error updating goal transaction:", error);
    throw new Error("Failed to update goal transaction");
  }
}

/**
 * Delete a transaction
 */
export async function deleteGoalTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.goalTransaction.findFirst({
      where: { id: transactionId, userId },
      include: { goal: true },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    await prisma.goalTransaction.delete({
      where: { id: transactionId },
    });

    // Recalculate goal's currentAmount based on remaining transactions
    const remainingTransactions = await prisma.goalTransaction.findMany({
      where: { goalId: existing.goalId },
    });

    const totalAmount = remainingTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const targetAmount = Number(existing.goal.targetAmount);
    const newCurrentAmount = Math.min(totalAmount, targetAmount);

    await prisma.goal.update({
      where: { id: existing.goalId },
      data: {
        currentAmount: newCurrentAmount,
      },
    });
  } catch (error) {
    console.error("Error deleting goal transaction:", error);
    throw new Error("Failed to delete goal transaction");
  }
}
