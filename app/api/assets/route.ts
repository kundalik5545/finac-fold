import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addAssetSchema } from "@/lib/form-schema";
import { z } from "zod";
import { ZodError } from "zod";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await prisma.asset.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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

    const validatedData = addAssetSchema.parse(body);

    // Convert date strings to Date objects if needed
    const purchaseDate =
      validatedData.purchaseDate instanceof Date
        ? validatedData.purchaseDate
        : new Date(validatedData.purchaseDate);

    const sellDate = validatedData.sellDate
      ? validatedData.sellDate instanceof Date
        ? validatedData.sellDate
        : new Date(validatedData.sellDate)
      : null;

    const asset = await prisma.asset.create({
      data: {
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
        userId: session.user.id,
      },
    });

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
