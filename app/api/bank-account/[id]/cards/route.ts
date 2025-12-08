import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { bankCardFormSchema } from "@/lib/bank-account-schema";
import { ZodError } from "zod";
import { getBankCards, createBankCard } from "@/action/bank-account";
import { StatusScode } from "@/lib/status-code";
import type { NextRequest } from "next/server";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * GET /api/bank-account/[id]/cards
 * Fetch all cards for a bank account
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

    const cards = await getBankCards(id, session.user.id);

    return NextResponse.json(
      { cards },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error fetching bank cards:", error);

    if (error instanceof Error && error.message === "Bank account not found") {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch bank cards" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/bank-account/[id]/cards
 * Create a new bank card
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
      validatedData = bankCardFormSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.issues },
          { status: StatusScode.BAD_REQUEST }
        );
      }
      throw validationError;
    }

    // Convert date strings to Date objects if provided
    const expiryDate = validatedData.expiryDate
      ? validatedData.expiryDate instanceof Date
        ? validatedData.expiryDate
        : new Date(validatedData.expiryDate)
      : null;

    const paymentDate = validatedData.paymentDate
      ? validatedData.paymentDate instanceof Date
        ? validatedData.paymentDate
        : new Date(validatedData.paymentDate)
      : null;

    // Validate dates if provided
    if (expiryDate && isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiry date" },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    if (paymentDate && isNaN(paymentDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid payment date" },
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

    // Prepare card data
    const cardData = {
      name: validatedData.name.trim(),
      cardNumber: toNullIfEmpty(validatedData.cardNumber),
      cardType: validatedData.cardType,
      cardIssuer: toNullIfEmpty(validatedData.cardIssuer),
      cvv: toNullIfEmpty(validatedData.cvv),
      expiryDate: expiryDate,
      limit: validatedData.limit ?? null,
      lastBillAmount: validatedData.lastBillAmount ?? null,
      paymentDueDay: validatedData.paymentDueDay ?? null,
      paymentMethod: toNullIfEmpty(validatedData.paymentMethod),
      cardPin: toNullIfEmpty(validatedData.cardPin),
      paymentStatus: validatedData.paymentStatus ?? null,
      paymentAmount: validatedData.paymentAmount ?? null,
      paymentDate: paymentDate,
      color: toNullIfEmpty(validatedData.color),
      icon: toNullIfEmpty(validatedData.icon),
      notes: toNullIfEmpty(validatedData.notes),
      isActive: validatedData.isActive ?? true,
    };

    // Create card
    const card = await createBankCard(id, cardData, session.user.id);

    return NextResponse.json(
      { card },
      { status: StatusScode.CREATED }
    );
  } catch (error) {
    console.error("Error creating bank card:", error);

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
        error: `Failed to create bank card: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

