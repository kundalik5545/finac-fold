import { auth } from "@/lib/auth";
import { updateBankAccountSchema } from "@/lib/schema/bank-account-schema";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * GET /api/bank-account/[id]
 * Fetch a single bank account with transactions and cards
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

    const bankAccount = await getBankAccount(id, session.user.id);

    return NextResponse.json({ bankAccount }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error fetching bank account:", error);

    if (error instanceof Error && error.message === "Bank account not found") {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch bank account" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/bank-account/[id]
 * Update a bank account
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
    const validatedData = updateBankAccountSchema.parse(body);

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
    if ("name" in validatedData) updateData.name = validatedData.name?.trim();
    if ("accountNumber" in validatedData)
      updateData.accountNumber = toNullIfEmpty(validatedData.accountNumber);
    if ("bankName" in validatedData)
      updateData.bankName = toNullIfEmpty(validatedData.bankName);
    if ("accountType" in validatedData)
      updateData.accountType = validatedData.accountType ?? null;
    if ("ifscCode" in validatedData)
      updateData.ifscCode = toNullIfEmpty(validatedData.ifscCode);
    if ("branch" in validatedData)
      updateData.branch = toNullIfEmpty(validatedData.branch);
    if ("startingBalance" in validatedData)
      updateData.startingBalance = validatedData.startingBalance;
    if ("icon" in validatedData)
      updateData.icon = toNullIfEmpty(validatedData.icon);
    if ("color" in validatedData)
      updateData.color = toNullIfEmpty(validatedData.color);
    if ("description" in validatedData)
      updateData.description = toNullIfEmpty(validatedData.description);
    if ("isActive" in validatedData)
      updateData.isActive = validatedData.isActive;
    if (
      "accountOpeningDate" in validatedData &&
      validatedData.accountOpeningDate !== undefined
    ) {
      const accountOpeningDate =
        validatedData.accountOpeningDate instanceof Date
          ? validatedData.accountOpeningDate
          : validatedData.accountOpeningDate
          ? new Date(validatedData.accountOpeningDate)
          : null;
      updateData.accountOpeningDate = accountOpeningDate;
    }
    if ("isInsuranceActive" in validatedData)
      updateData.isInsuranceActive = validatedData.isInsuranceActive ?? false;
    if ("insuranceAmount" in validatedData)
      updateData.insuranceAmount = validatedData.insuranceAmount ?? null;

    const bankAccount = await updateBankAccount(
      id,
      updateData,
      session.user.id
    );

    return NextResponse.json({ bankAccount }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error updating bank account:", error);

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
      { error: "Failed to update bank account" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/bank-account/[id]
 * Delete a bank account
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

    await deleteBankAccount(id, session.user.id);

    return NextResponse.json(
      { message: "Bank account deleted successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error deleting bank account:", error);

    if (error instanceof Error && error.message === "Bank account not found") {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bank account" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
