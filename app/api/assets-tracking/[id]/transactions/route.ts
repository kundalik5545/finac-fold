import { auth } from "@/lib/auth";
import { assetTransactionSchema } from "@/lib/assets-tracking-schema";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getTransactions, createTransaction } from "@/action/assets-tracking";

type ParamsType = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assetId } = await params;

    const transactions = await getTransactions(assetId, session.user.id);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);

    if (error instanceof Error && error.message === "Asset not found") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assetId } = await params;
    const body = await request.json();

    // Validate data with schema
    const validatedData = assetTransactionSchema.parse(body);

    // Convert date string to Date object
    const date =
      validatedData.date instanceof Date
        ? validatedData.date
        : new Date(validatedData.date);

    // Create transaction (also updates asset currentValue)
    const transaction = await createTransaction(
      assetId,
      {
        value: validatedData.value,
        date: date,
        notes: validatedData.notes || null,
      },
      session.user.id
    );

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Asset not found") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
