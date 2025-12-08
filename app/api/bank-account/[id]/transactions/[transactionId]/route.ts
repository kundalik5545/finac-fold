import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateBankTransactionSchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import {
  updateBankTransaction,
  deleteBankTransaction,
} from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

type ParamsType = {
  params: Promise<{ id: string; transactionId: string }>;
};

/**
 * PATCH /api/bank-account/[id]/transactions/[transactionId]
 * Update a bank transaction
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

    const { transactionId } = await params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateBankTransactionSchema.parse(body);

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
    if (
      "transactionDate" in validatedData &&
      validatedData.transactionDate !== undefined
    ) {
      const transactionDate =
        validatedData.transactionDate instanceof Date
          ? validatedData.transactionDate
          : new Date(validatedData.transactionDate);
      if (!isNaN(transactionDate.getTime())) {
        updateData.transactionDate = transactionDate;
      }
    }
    if ("transactionType" in validatedData)
      updateData.transactionType = validatedData.transactionType;
    if ("description" in validatedData)
      updateData.description = toNullIfEmpty(validatedData.description);

    const transaction = await updateBankTransaction(
      transactionId,
      updateData,
      session.user.id
    );

    return NextResponse.json({ transaction }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error updating bank transaction:", error);

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
      { error: "Failed to update bank transaction" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/bank-account/[id]/transactions/[transactionId]
 * Delete a bank transaction
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

    const { transactionId } = await params;

    await deleteBankTransaction(transactionId, session.user.id);

    return NextResponse.json(
      { message: "Bank transaction deleted successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error deleting bank transaction:", error);

    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bank transaction" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
