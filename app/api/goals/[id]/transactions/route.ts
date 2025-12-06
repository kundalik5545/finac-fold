import { auth } from "@/lib/auth";
import { goalTransactionSchema } from "@/lib/goals-schema";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getGoalTransactions,
  createGoalTransaction,
} from "@/action/goals";

type ParamsType = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: goalId } = await params;

    const transactions = await getGoalTransactions(goalId, session.user.id);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching goal transactions:", error);

    if (error instanceof Error && error.message === "Goal not found") {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch goal transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: goalId } = await params;
    const body = await request.json();

    // Validate data with schema
    const validatedData = goalTransactionSchema.parse(body);

    // Convert date string to Date object
    const date =
      validatedData.date instanceof Date
        ? validatedData.date
        : new Date(validatedData.date);

    // Create transaction (also updates goal currentAmount)
    const transaction = await createGoalTransaction(
      goalId,
      {
        amount: validatedData.amount,
        date: date,
        notes: validatedData.notes || null,
      },
      session.user.id
    );

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Goal not found") {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create goal transaction" },
      { status: 500 }
    );
  }
}

