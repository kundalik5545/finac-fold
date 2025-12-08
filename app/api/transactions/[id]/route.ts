import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

type ParamsType = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/transactions/[id]
 * Fetch a single transaction by ID
 */
export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const transaction = await getTransaction(id, session.user.id);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json({ transaction }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PUT /api/transactions/[id]
 * Update a transaction
 */
export async function PUT(request: NextRequest, { params }: ParamsType) {
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

    // Validate data with schema
    let validatedData;
    try {
      validatedData = updateTransactionSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.issues },
          { status: StatusScode.BAD_REQUEST }
        );
      }
      throw validationError;
    }

    // Convert date string to Date object if provided
    let date: Date | undefined;
    if (validatedData.date) {
      date =
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date);

      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Invalid transaction date" },
          { status: StatusScode.BAD_REQUEST }
        );
      }
    }

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

    // Prepare update data
    const updateData: any = {};
    if (validatedData.amount !== undefined)
      updateData.amount = validatedData.amount;
    if (validatedData.transactionType !== undefined)
      updateData.transactionType = validatedData.transactionType;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (date !== undefined) updateData.date = date;
    if (validatedData.description !== undefined)
      updateData.description = toNullIfEmpty(validatedData.description);
    if (validatedData.currency !== undefined)
      updateData.currency = validatedData.currency;
    if (validatedData.isActive !== undefined)
      updateData.isActive = validatedData.isActive;
    if (validatedData.bankAccountId !== undefined)
      updateData.bankAccountId = validatedData.bankAccountId ?? null;
    if (validatedData.categoryId !== undefined)
      updateData.categoryId = validatedData.categoryId ?? null;
    if (validatedData.subCategoryId !== undefined)
      updateData.subCategoryId = validatedData.subCategoryId ?? null;
    if (validatedData.paymentMethod !== undefined)
      updateData.paymentMethod = validatedData.paymentMethod ?? null;

    // Update transaction
    const transaction = await updateTransaction(
      id,
      updateData,
      session.user.id
    );

    return NextResponse.json({ transaction }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error updating transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to update transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/transactions/[id]
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
    return NextResponse.json(
      {
        error: `Failed to delete transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
