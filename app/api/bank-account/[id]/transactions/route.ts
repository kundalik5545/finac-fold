import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { bankTransactionFormSchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import {
  getBankTransactions,
  createBankTransaction,
} from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * GET /api/bank-account/[id]/transactions
 * Fetch all transactions for a bank account
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

    const transactions = await getBankTransactions(id, session.user.id);

    return NextResponse.json({ transactions }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error fetching bank transactions:", error);

    if (error instanceof Error && error.message === "Bank account not found") {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch bank transactions" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/bank-account/[id]/transactions
 * Create a new bank transaction
 */
export async function POST(request: NextRequest, { params }: ParamsType) {
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
      validatedData = bankTransactionFormSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.issues },
          { status: StatusScode.BAD_REQUEST }
        );
      }
      throw validationError;
    }

    // Convert date string to Date object
    const transactionDate =
      validatedData.transactionDate instanceof Date
        ? validatedData.transactionDate
        : new Date(validatedData.transactionDate);

    // Validate date
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid transaction date" },
        { status: StatusScode.BAD_REQUEST }
      );
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

    // Prepare transaction data
    const transactionData = {
      amount: validatedData.amount,
      transactionDate: transactionDate,
      transactionType: validatedData.transactionType,
      description: toNullIfEmpty(validatedData.description),
    };

    // Create transaction
    const transaction = await createBankTransaction(
      id,
      transactionData,
      session.user.id
    );

    return NextResponse.json({ transaction }, { status: StatusScode.CREATED });
  } catch (error) {
    console.error("Error creating bank transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "Bank account not found") {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create bank transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
