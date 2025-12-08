import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { fetchPricesSchema } from "@/lib/schema/investments-schema";
import { ZodError } from "zod";
import { fetchLatestPrices } from "@/action/investments";
import { StatusScode } from "@/helpers/status-code";

/**
 * POST /api/investments/fetch-prices
 * Fetch latest prices for investments from Alpha Vantage API
 */
export async function POST(request: NextRequest) {
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
    const validatedData = fetchPricesSchema.parse(body);

    // Fetch latest prices
    const updatedInvestments = await fetchLatestPrices(
      validatedData.investmentIds,
      session.user.id
    );

    return NextResponse.json(
      {
        investments: updatedInvestments,
        successCount: updatedInvestments.length,
        totalRequested: validatedData.investmentIds.length,
      },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error fetching latest prices:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to fetch latest prices: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
