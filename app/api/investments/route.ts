import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { investmentFormSchema } from "@/lib/schema/investments-schema";
import { ZodError } from "zod";
import { getInvestments, createInvestment } from "@/action/investments";
import { StatusScode } from "@/helpers/status-code";
import { InvestmentType } from "@/lib/types/investments-types";
import { NextRequest } from "next/server";

/**
 * GET /api/investments
 * Fetch all investments (optionally filtered by type)
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

    // Get optional type filter from query params
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get("type");
    const type = typeParam ? (typeParam as InvestmentType) : undefined;

    const investments = await getInvestments(session.user.id, type);

    return NextResponse.json({ investments }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/investments
 * Create a new investment
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
    const validatedData = investmentFormSchema.parse(body);

    // Convert date string to Date object
    const purchaseDate =
      validatedData.purchaseDate instanceof Date
        ? validatedData.purchaseDate
        : new Date(validatedData.purchaseDate);

    // Validate date
    if (isNaN(purchaseDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid purchase date" },
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

    // Prepare investment data
    const investmentData = {
      name: validatedData.name.trim(),
      type: validatedData.type,
      symbol: toNullIfEmpty(validatedData.symbol),
      icon: toNullIfEmpty(validatedData.icon),
      color: toNullIfEmpty(validatedData.color),
      currentPrice: validatedData.currentPrice || 0,
      investedAmount: validatedData.investedAmount,
      quantity: validatedData.quantity,
      purchaseDate: purchaseDate,
      description: toNullIfEmpty(validatedData.description),
    };

    // Create investment
    const investment = await createInvestment(
      investmentData,
      session.user.id
    );

    return NextResponse.json(
      { investment },
      { status: StatusScode.CREATED }
    );
  } catch (error) {
    console.error("Error creating investment:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create investment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

