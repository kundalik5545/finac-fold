import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/bank-account-schema";
import { ZodError } from "zod";
import { updateTransaction, deleteTransaction } from "@/action/bank-account";
import { StatusScode } from "@/lib/status-code";
import type { NextRequest } from "next/server";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * PATCH /api/bank-account/transactions/[id]
 * Update a transaction
 */
export async function PATCH(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateTransactionSchema.parse(body);

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value: string | null | undefined): string | null => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return null;
      }
      return value;
    };

    // Prepare update object
    const updateData: Record<string, any> = {};
    if ("amount" in validatedData) updateData.amount = validatedData.amount;
    if ("transactionType" in validatedData)
      updateData.transactionType = validatedData.transactionType;
    if ("status" in validatedData) updateData.status = validatedData.status;
    if ("date" in validatedData && validatedData.date !== undefined) {
      const date =
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date);
      if (!isNaN(date.getTime())) {
        updateData.date = date;
      }
    }
    if ("description" in validatedData)
      updateData.description = toNullIfEmpty(validatedData.description);
    if ("currency" in validatedData) updateData.currency = validatedData.currency;
    if ("isActive" in validatedData) updateData.isActive = validatedData.isActive;
    if ("bankAccountId" in validatedData)
      updateData.bankAccountId = validatedData.bankAccountId ?? null;
    if ("categoryId" in validatedData)
      updateData.categoryId = validatedData.categoryId ?? null;
    if ("subCategoryId" in validatedData)
      updateData.subCategoryId = validatedData.subCategoryId ?? null;
    if ("paymentMethod" in validatedData)
      updateData.paymentMethod = validatedData.paymentMethod ?? null;

    const transaction = await updateTransaction(
      id,
      updateData,
      session.user.id
    );

    return NextResponse.json(
      { transaction },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error updating transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/bank-account/transactions/[id]
 * Delete a transaction
 */
export async function DELETE(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { id } = await params;

    await deleteTransaction(id, session.user.id);

    return NextResponse.json(
      { message: "Transaction deleted successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error deleting transaction:", error);

    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

