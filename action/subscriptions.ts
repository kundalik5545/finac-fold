"use server";

import prisma from "@/lib/prisma";
import {
  Subscription,
  calculateMonthlyEquivalent,
} from "@/lib/subscriptions-types";
import { Prisma } from "@/app/generated/prisma/client";

// ============================================
// SUBSCRIPTION FUNCTIONS
// ============================================

/**
 * Fetch all active subscriptions for a user
 */
export async function getSubscriptions(
  userId: string
): Promise<Subscription[]> {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        nextDueDate: "asc",
      },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return [];
    }

    return subscriptions.map((sub) => ({
      ...sub,
      amount: Number(sub.amount),
      createdAt: new Date(sub.createdAt),
      updatedAt: new Date(sub.updatedAt),
      startDate: new Date(sub.startDate),
      nextDueDate: new Date(sub.nextDueDate),
      cancelledAt: sub.cancelledAt ? new Date(sub.cancelledAt) : null,
    }));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error("Failed to fetch subscriptions");
  }
}

/**
 * Fetch a single subscription
 */
export async function getSubscription(
  subscriptionId: string,
  userId: string
): Promise<Subscription> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return {
      ...subscription,
      amount: Number(subscription.amount),
      createdAt: new Date(subscription.createdAt),
      updatedAt: new Date(subscription.updatedAt),
      startDate: new Date(subscription.startDate),
      nextDueDate: new Date(subscription.nextDueDate),
      cancelledAt: subscription.cancelledAt
        ? new Date(subscription.cancelledAt)
        : null,
    } as Subscription;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw new Error("Failed to fetch subscription");
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  data: Omit<
    Prisma.SubscriptionCreateInput,
    "user" | "createdAt" | "updatedAt"
  >,
  userId: string
): Promise<Subscription> {
  try {
    const subscription = await prisma.subscription.create({
      data: {
        ...data,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return {
      ...subscription,
      amount: Number(subscription.amount),
      createdAt: new Date(subscription.createdAt),
      updatedAt: new Date(subscription.updatedAt),
      startDate: new Date(subscription.startDate),
      nextDueDate: new Date(subscription.nextDueDate),
      cancelledAt: subscription.cancelledAt
        ? new Date(subscription.cancelledAt)
        : null,
    } as Subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  data: Omit<
    Prisma.SubscriptionUpdateInput,
    "user" | "createdAt" | "updatedAt"
  >,
  userId: string
): Promise<Subscription> {
  try {
    // Verify ownership
    const existing = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Subscription not found");
    }

    const subscription = await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return {
      ...subscription,
      amount: Number(subscription.amount),
      createdAt: new Date(subscription.createdAt),
      updatedAt: new Date(subscription.updatedAt),
      startDate: new Date(subscription.startDate),
      nextDueDate: new Date(subscription.nextDueDate),
      cancelledAt: subscription.cancelledAt
        ? new Date(subscription.cancelledAt)
        : null,
    } as Subscription;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }
}

/**
 * Delete (soft delete) a subscription
 */
export async function deleteSubscription(
  subscriptionId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const existing = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Subscription not found");
    }

    await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        isActive: false,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw new Error("Failed to delete subscription");
  }
}
