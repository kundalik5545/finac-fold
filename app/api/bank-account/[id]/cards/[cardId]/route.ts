import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateBankCardSchema } from "@/lib/bank-account-schema";
import { ZodError } from "zod";
import { updateBankCard, deleteBankCard } from "@/action/bank-account";
import { StatusScode } from "@/lib/status-code";
import type { NextRequest } from "next/server";

type ParamsType = {
  params: Promise<{ id: string; cardId: string }>;
};

/**
 * PATCH /api/bank-account/[id]/cards/[cardId]
 * Update a bank card
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

    const { cardId } = await params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateBankCardSchema.parse(body);

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
    if ("cardNumber" in validatedData)
      updateData.cardNumber = toNullIfEmpty(validatedData.cardNumber);
    if ("cardType" in validatedData) updateData.cardType = validatedData.cardType;
    if ("cardIssuer" in validatedData)
      updateData.cardIssuer = toNullIfEmpty(validatedData.cardIssuer);
    if ("cvv" in validatedData) updateData.cvv = toNullIfEmpty(validatedData.cvv);
    if ("expiryDate" in validatedData && validatedData.expiryDate !== undefined) {
      const expiryDate =
        validatedData.expiryDate instanceof Date
          ? validatedData.expiryDate
          : validatedData.expiryDate
          ? new Date(validatedData.expiryDate)
          : null;
      updateData.expiryDate = expiryDate;
    }
    if ("limit" in validatedData) updateData.limit = validatedData.limit ?? null;
    if ("lastBillAmount" in validatedData)
      updateData.lastBillAmount = validatedData.lastBillAmount ?? null;
    if ("paymentDueDay" in validatedData)
      updateData.paymentDueDay = validatedData.paymentDueDay ?? null;
    if ("paymentMethod" in validatedData)
      updateData.paymentMethod = toNullIfEmpty(validatedData.paymentMethod);
    if ("cardPin" in validatedData)
      updateData.cardPin = toNullIfEmpty(validatedData.cardPin);
    if ("paymentStatus" in validatedData)
      updateData.paymentStatus = validatedData.paymentStatus ?? null;
    if ("paymentAmount" in validatedData)
      updateData.paymentAmount = validatedData.paymentAmount ?? null;
    if ("paymentDate" in validatedData && validatedData.paymentDate !== undefined) {
      const paymentDate =
        validatedData.paymentDate instanceof Date
          ? validatedData.paymentDate
          : validatedData.paymentDate
          ? new Date(validatedData.paymentDate)
          : null;
      updateData.paymentDate = paymentDate;
    }
    if ("color" in validatedData)
      updateData.color = toNullIfEmpty(validatedData.color);
    if ("icon" in validatedData)
      updateData.icon = toNullIfEmpty(validatedData.icon);
    if ("notes" in validatedData)
      updateData.notes = toNullIfEmpty(validatedData.notes);
    if ("isActive" in validatedData) updateData.isActive = validatedData.isActive;

    const card = await updateBankCard(cardId, updateData, session.user.id);

    return NextResponse.json(
      { card },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error updating bank card:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "Bank card not found") {
      return NextResponse.json(
        { error: "Bank card not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to update bank card" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/bank-account/[id]/cards/[cardId]
 * Delete a bank card
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

    const { cardId } = await params;

    await deleteBankCard(cardId, session.user.id);

    return NextResponse.json(
      { message: "Bank card deleted successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error deleting bank card:", error);

    if (error instanceof Error && error.message === "Bank card not found") {
      return NextResponse.json(
        { error: "Bank card not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bank card" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

