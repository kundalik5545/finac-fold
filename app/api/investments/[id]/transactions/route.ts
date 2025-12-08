import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { investmentTransactionSchema } from "@/lib/schema/investments-schema";
import { ZodError } from "zod";
import {
  getInvestmentTransactions,
  createInvestmentTransaction,
} from "@/action/investments";
import { StatusScode } from "@/helpers/status-code";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * GET /api/investments/[id]/transactions
 * Get all transactions for an investment
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

    const transactions = await getInvestmentTransactions(id, session.user.id);

    return NextResponse.json(
      { transactions },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error fetching investment transactions:", error);

    if (error instanceof Error && error.message === "Investment not found") {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch investment transactions" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/investments/[id]/transactions
 * Create a new investment transaction
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
    const validatedData = investmentTransactionSchema.parse(body);

    // Convert date string to Date object
    const date =
      validatedData.date instanceof Date
        ? validatedData.date
        : new Date(validatedData.date);

    // Validate date
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (
      value: string | null | undefined
    ): string | null => {
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
      date: date,
      transactionType: validatedData.transactionType,
      notes: toNullIfEmpty(validatedData.notes),
    };

    // Create transaction
    const transaction = await createInvestmentTransaction(
      id,
      transactionData,
      session.user.id
    );

    return NextResponse.json(
      { transaction },
      { status: StatusScode.CREATED }
    );
  } catch (error) {
    console.error("Error creating investment transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "Investment not found") {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create investment transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

