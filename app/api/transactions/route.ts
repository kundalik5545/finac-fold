import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { transactionFormSchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import { getTransactions, createTransaction } from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

/**
 * GET /api/transactions
 * Fetch all transactions for the authenticated user (with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { searchParams } = new URL(request.url);
    const bankAccountId = searchParams.get("bankAccountId");
    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const transactionType = searchParams.get("transactionType") as
      | "CREDIT"
      | "DEBIT"
      | null;
    const paymentMethod = searchParams.get("paymentMethod") as
      | "CASH"
      | "UPI"
      | "CARD"
      | "ONLINE"
      | "OTHER"
      | null;
    const status = searchParams.get("status") as
      | "PENDING"
      | "COMPLETED"
      | "FAILED"
      | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const skip = searchParams.get("skip");
    const take = searchParams.get("take");

    const filters = {
      ...(bankAccountId && { bankAccountId }),
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
      ...(transactionType && { transactionType }),
      ...(paymentMethod && { paymentMethod }),
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(skip && { skip: parseInt(skip, 10) }),
      ...(take && { take: parseInt(take, 10) }),
    };

    const result = await getTransactions(session.user.id, filters);

    return NextResponse.json(
      { transactions: result.transactions, total: result.total },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/transactions
 * Create a new transaction
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const body = await request.json();

    // Validate data with schema
    let validatedData;
    try {
      validatedData = transactionFormSchema.parse(body);
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
    const date =
      validatedData.date instanceof Date
        ? validatedData.date
        : new Date(validatedData.date);

    // Validate date
    if (isNaN(date.getTime())) {
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
      transactionType: validatedData.transactionType,
      status: validatedData.status ?? "PENDING",
      date: date,
      description: toNullIfEmpty(validatedData.description),
      currency: validatedData.currency ?? "INR",
      isActive: validatedData.isActive ?? true,
      bankAccountId: validatedData.bankAccountId ?? null,
      categoryId: validatedData.categoryId ?? null,
      subCategoryId: validatedData.subCategoryId ?? null,
      paymentMethod: validatedData.paymentMethod ?? null,
    };

    // Create transaction
    const transaction = await createTransaction(
      transactionData,
      session.user.id
    );

    return NextResponse.json({ transaction }, { status: StatusScode.CREATED });
  } catch (error) {
    console.error("Error creating transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
