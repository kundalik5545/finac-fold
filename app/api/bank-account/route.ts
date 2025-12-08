import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { bankAccountFormSchema } from "@/lib/bank-account-schema";
import { ZodError } from "zod";
import { getBankAccounts, createBankAccount } from "@/action/bank-account";
import { StatusScode } from "@/lib/status-code";

/**
 * GET /api/bank-account
 * Fetch all bank accounts for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const bankAccounts = await getBankAccounts(session.user.id);

    return NextResponse.json(
      { bankAccounts },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/bank-account
 * Create a new bank account
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
      validatedData = bankAccountFormSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.issues },
          { status: StatusScode.BAD_REQUEST }
        );
      }
      throw validationError;
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

    // Convert date string to Date object if provided
    const accountOpeningDate = validatedData.accountOpeningDate
      ? validatedData.accountOpeningDate instanceof Date
        ? validatedData.accountOpeningDate
        : new Date(validatedData.accountOpeningDate)
      : null;

    // Validate date if provided
    if (accountOpeningDate && isNaN(accountOpeningDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid account opening date" },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    // Prepare bank account data
    const bankAccountData = {
      name: validatedData.name.trim(),
      accountNumber: toNullIfEmpty(validatedData.accountNumber),
      bankName: toNullIfEmpty(validatedData.bankName),
      accountType: validatedData.accountType ?? null,
      ifscCode: toNullIfEmpty(validatedData.ifscCode),
      branch: toNullIfEmpty(validatedData.branch),
      startingBalance: validatedData.startingBalance ?? 0,
      icon: toNullIfEmpty(validatedData.icon),
      color: toNullIfEmpty(validatedData.color),
      description: toNullIfEmpty(validatedData.description),
      isActive: validatedData.isActive ?? true,
      accountOpeningDate: accountOpeningDate,
      isInsuranceActive: validatedData.isInsuranceActive ?? false,
      insuranceAmount: validatedData.insuranceAmount ?? null,
    };

    // Create bank account
    const bankAccount = await createBankAccount(bankAccountData, session.user.id);

    return NextResponse.json(
      { bankAccount },
      { status: StatusScode.CREATED }
    );
  } catch (error) {
    console.error("Error creating bank account:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create bank account: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

