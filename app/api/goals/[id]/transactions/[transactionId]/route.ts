import { auth } from "@/lib/auth";
import { updateGoalTransactionSchema } from "@/lib/schema/goals-schema";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { updateGoalTransaction, deleteGoalTransaction } from "@/action/goals";

type ParamsType = { params: Promise<{ id: string; transactionId: string }> };

export async function PATCH(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateGoalTransactionSchema.parse(body);

    // Prepare update object
    const updateData: Record<string, any> = {};
    if ("amount" in validatedData) updateData.amount = validatedData.amount;
    if ("date" in validatedData && validatedData.date !== undefined) {
      const date =
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date);
      updateData.date = date;
    }
    if ("notes" in validatedData)
      updateData.notes = validatedData.notes ?? null;

    const transaction = await updateGoalTransaction(
      transactionId,
      updateData,
      session.user.id
    );

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error updating goal transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update goal transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;

    await deleteGoalTransaction(transactionId, session.user.id);

    return NextResponse.json({
      message: "Goal transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goal transaction:", error);

    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete goal transaction" },
      { status: 500 }
    );
  }
}
