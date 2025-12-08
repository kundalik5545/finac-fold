import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { assetFormSchema } from "@/lib/schema/assets-tracking-schema";
import { ZodError } from "zod";
import { getAssets, createAsset } from "@/action/assets-tracking";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await getAssets(session.user.id);

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate data with schema
    const validatedData = assetFormSchema.parse(body);

    // Convert date strings to Date objects
    const purchaseDate =
      validatedData.purchaseDate instanceof Date
        ? validatedData.purchaseDate
        : new Date(validatedData.purchaseDate);

    const sellDate = validatedData.sellDate
      ? validatedData.sellDate instanceof Date
        ? validatedData.sellDate
        : new Date(validatedData.sellDate)
      : null;

    // Create asset with initial transaction
    const asset = await createAsset(
      {
        name: validatedData.name,
        type: validatedData.type,
        icon: validatedData.icon || null,
        color: validatedData.color || null,
        currentValue: validatedData.currentValue,
        purchaseValue: validatedData.purchaseValue,
        purchaseDate: purchaseDate,
        purchaseReason: validatedData.purchaseReason || null,
        paymentMethod: validatedData.paymentMethod || null,
        sellDate: sellDate,
        sellPrice: validatedData.sellPrice || null,
        profitLoss: validatedData.profitLoss || null,
        sellReason: validatedData.sellReason || null,
        transactionStatus: validatedData.transactionStatus || null,
        description: validatedData.description || null,
      },
      session.user.id
    );

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
