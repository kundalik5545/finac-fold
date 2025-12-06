"use server";

import prisma from "@/lib/prisma";
import { Asset, AssetsTransaction } from "@/lib/assets-tracking-types";
import { Prisma } from "@/app/generated/prisma/client";

// ============================================
// ASSET FUNCTIONS
// ============================================

/**
 * Fetch all assets for a user
 */
export async function getAssets(userId: string): Promise<Asset[]> {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return assets.map((asset) => ({
      ...asset,
      currentValue: Number(asset.currentValue),
      purchaseValue: Number(asset.purchaseValue),
      sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
      profitLoss: asset.profitLoss ? Number(asset.profitLoss) : null,
    }));
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw new Error("Failed to fetch assets");
  }
}

/**
 * Fetch a single asset with its transactions
 */
export async function getAsset(
  assetId: string,
  userId: string
): Promise<Asset & { assetsTransactions: AssetsTransaction[] }> {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        userId,
      },
      include: {
        assetsTransactions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    return {
      ...asset,
      currentValue: Number(asset.currentValue),
      purchaseValue: Number(asset.purchaseValue),
      sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
      profitLoss: asset.profitLoss ? Number(asset.profitLoss) : null,
      assetsTransactions: asset.assetsTransactions.map((t) => ({
        ...t,
        value: Number(t.value),
      })),
    };
  } catch (error) {
    console.error("Error fetching asset:", error);
    throw new Error("Failed to fetch asset");
  }
}

/**
 * Create a new asset (also creates initial transaction)
 */
export async function createAsset(
  data: Omit<Prisma.AssetCreateInput, "user" | "assetsTransactions">,
  userId: string
): Promise<Asset> {
  try {
    // Create asset with initial transaction
    const asset = await prisma.asset.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
        assetsTransactions: {
          create: {
            value: data.purchaseValue,
            date: data.purchaseDate,
            notes: "Initial purchase",
            user: {
              connect: { id: userId },
            },
          },
        },
      },
    });

    return {
      ...asset,
      currentValue: Number(asset.currentValue),
      purchaseValue: Number(asset.purchaseValue),
      sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
      profitLoss: asset.profitLoss ? Number(asset.profitLoss) : null,
    };
  } catch (error) {
    console.error("Error creating asset:", error);
    throw new Error("Failed to create asset");
  }
}

/**
 * Update an asset
 */
export async function updateAsset(
  assetId: string,
  data: Partial<Omit<Prisma.AssetUpdateInput, "user" | "assetsTransactions">>,
  userId: string
): Promise<Asset> {
  try {
    // Verify ownership
    const existing = await prisma.asset.findFirst({
      where: { id: assetId, userId },
    });

    if (!existing) {
      throw new Error("Asset not found");
    }

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data,
    });

    return {
      ...asset,
      currentValue: Number(asset.currentValue),
      purchaseValue: Number(asset.purchaseValue),
      sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
      profitLoss: asset.profitLoss ? Number(asset.profitLoss) : null,
    };
  } catch (error) {
    console.error("Error updating asset:", error);
    throw new Error("Failed to update asset");
  }
}

/**
 * Delete an asset (cascade delete transactions)
 */
export async function deleteAsset(
  assetId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.asset.findFirst({
      where: { id: assetId, userId },
    });

    if (!existing) {
      throw new Error("Asset not found");
    }

    await prisma.asset.delete({
      where: { id: assetId },
    });
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw new Error("Failed to delete asset");
  }
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

/**
 * Get all transactions for an asset
 */
export async function getTransactions(
  assetId: string,
  userId: string
): Promise<AssetsTransaction[]> {
  try {
    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, userId },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    const transactions = await prisma.assetsTransaction.findMany({
      where: {
        assetId,
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return transactions.map((t) => ({
      ...t,
      value: Number(t.value),
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

/**
 * Create a new transaction (updates asset currentValue)
 */
export async function createTransaction(
  assetId: string,
  data: Omit<Prisma.AssetsTransactionCreateInput, "asset" | "user">,
  userId: string
): Promise<AssetsTransaction> {
  try {
    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, userId },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    // Create transaction and update asset currentValue in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.assetsTransaction.create({
        data: {
          ...data,
          asset: {
            connect: { id: assetId },
          },
          user: {
            connect: { id: userId },
          },
        },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: {
          currentValue: data.value,
        },
      }),
    ]);

    return {
      ...transaction,
      value: Number(transaction.value),
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
  data: Partial<Omit<Prisma.AssetsTransactionUpdateInput, "asset" | "user">>,
  userId: string
): Promise<AssetsTransaction> {
  try {
    // Verify ownership
    const existing = await prisma.assetsTransaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    const transaction = await prisma.assetsTransaction.update({
      where: { id: transactionId },
      data,
    });

    // If value was updated, update asset's currentValue to the latest transaction value
    if (data.value !== undefined) {
      const latestTransaction = await prisma.assetsTransaction.findFirst({
        where: { assetId: existing.assetId },
        orderBy: { date: "desc" },
      });

      if (latestTransaction) {
        await prisma.asset.update({
          where: { id: existing.assetId },
          data: { currentValue: latestTransaction.value },
        });
      }
    }

    return {
      ...transaction,
      value: Number(transaction.value),
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
    const existing = await prisma.assetsTransaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    await prisma.assetsTransaction.delete({
      where: { id: transactionId },
    });

    // Update asset's currentValue to the latest transaction value
    const latestTransaction = await prisma.assetsTransaction.findFirst({
      where: { assetId: existing.assetId },
      orderBy: { date: "desc" },
    });

    if (latestTransaction) {
      await prisma.asset.update({
        where: { id: existing.assetId },
        data: { currentValue: latestTransaction.value },
      });
    } else {
      // If no transactions left, set to purchase value
      const asset = await prisma.asset.findUnique({
        where: { id: existing.assetId },
      });
      if (asset) {
        await prisma.asset.update({
          where: { id: existing.assetId },
          data: { currentValue: asset.purchaseValue },
        });
      }
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  }
}
