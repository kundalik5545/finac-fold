import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateInvestmentSchema } from "@/lib/schema/investments-schema";
import { ZodError } from "zod";
import {
  getInvestment,
  updateInvestment,
  deleteInvestment,
} from "@/action/investments";
import { StatusScode } from "@/helpers/status-code";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * GET /api/investments/[id]
 * Get investment details
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

    const investment = await getInvestment(id, session.user.id);

    return NextResponse.json({ investment }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error fetching investment:", error);

    if (error instanceof Error && error.message === "Investment not found") {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch investment" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/investments/[id]
 * Update investment
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

    // Validate data with schema (partial updates allowed)
    const validatedData = updateInvestmentSchema.parse(body);

    // Convert date string to Date object if provided
    let purchaseDate: Date | undefined;
    if (validatedData.purchaseDate) {
      purchaseDate =
        validatedData.purchaseDate instanceof Date
          ? validatedData.purchaseDate
          : new Date(validatedData.purchaseDate);

      if (isNaN(purchaseDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid purchase date" },
          { status: StatusScode.BAD_REQUEST }
        );
      }
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

    // Prepare update data
    const updateData: any = {};
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name.trim();
    }
    if (validatedData.type !== undefined) {
      updateData.type = validatedData.type;
    }
    if (validatedData.symbol !== undefined) {
      updateData.symbol = toNullIfEmpty(validatedData.symbol);
    }
    if (validatedData.icon !== undefined) {
      updateData.icon = toNullIfEmpty(validatedData.icon);
    }
    if (validatedData.color !== undefined) {
      updateData.color = toNullIfEmpty(validatedData.color);
    }
    if (validatedData.currentPrice !== undefined) {
      updateData.currentPrice = validatedData.currentPrice;
    }
    if (validatedData.investedAmount !== undefined) {
      updateData.investedAmount = validatedData.investedAmount;
    }
    if (validatedData.quantity !== undefined) {
      updateData.quantity = validatedData.quantity;
    }
    if (purchaseDate) {
      updateData.purchaseDate = purchaseDate;
    }
    if (validatedData.description !== undefined) {
      updateData.description = toNullIfEmpty(validatedData.description);
    }

    // Update investment
    const investment = await updateInvestment(id, updateData, session.user.id);

    return NextResponse.json({ investment }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error updating investment:", error);

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
        error: `Failed to update investment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/investments/[id]
 * Delete investment
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

    await deleteInvestment(id, session.user.id);

    return NextResponse.json(
      { message: "Investment deleted successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error deleting investment:", error);

    if (error instanceof Error && error.message === "Investment not found") {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete investment" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

