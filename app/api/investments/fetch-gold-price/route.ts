import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { fetchGoldPrices } from "@/action/investments";
import { StatusScode } from "@/helpers/status-code";

/**
 * POST /api/investments/fetch-gold-price
 * Fetch latest gold price from GOLD_PRICE_API_URI and update all gold investments
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

    // Fetch latest gold price and update all gold investments
    const updatedInvestments = await fetchGoldPrices(session.user.id);

    return NextResponse.json(
      {
        investments: updatedInvestments,
        successCount: updatedInvestments.length,
        totalRequested: updatedInvestments.length,
      },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error fetching latest gold price:", error);

    return NextResponse.json(
      {
        error: `Failed to fetch latest gold price: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
