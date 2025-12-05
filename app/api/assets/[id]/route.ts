import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addAssetSchema } from "@/lib/form-schema";
import { z } from "zod";
import { ZodError } from "zod";
import type { NextRequest } from "next/server";

type ParamsType = { params: { id: string } };

// Create a PATCH schema allowing partial updates (all fields optional)
const updateAssetSchema = addAssetSchema.partial();

export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateAssetSchema.parse(body);

    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Prepare update object only including provided fields
    const updateData: Record<string, any> = {};
    if ("name" in validatedData) updateData.name = validatedData.name;
    if ("type" in validatedData) updateData.type = validatedData.type;
    if ("icon" in validatedData) updateData.icon = validatedData.icon ?? null;
    if ("color" in validatedData)
      updateData.color = validatedData.color ?? null;
    if ("currentValue" in validatedData)
      updateData.currentValue = validatedData.currentValue;
    if ("purchaseValue" in validatedData)
      updateData.purchaseValue = validatedData.purchaseValue;
    if (
      "purchaseDate" in validatedData &&
      validatedData.purchaseDate !== undefined
    ) {
      const purchaseDate =
        validatedData.purchaseDate instanceof Date
          ? validatedData.purchaseDate
          : new Date(validatedData.purchaseDate);
      updateData.purchaseDate = purchaseDate;
    }
    if ("purchaseReason" in validatedData)
      updateData.purchaseReason = validatedData.purchaseReason ?? null;
    if ("paymentMethod" in validatedData)
      updateData.paymentMethod = validatedData.paymentMethod ?? null;
    if ("sellDate" in validatedData) {
      const sellDate = validatedData.sellDate
        ? validatedData.sellDate instanceof Date
          ? validatedData.sellDate
          : new Date(validatedData.sellDate)
        : null;
      updateData.sellDate = sellDate;
    }
    if ("sellPrice" in validatedData)
      updateData.sellPrice = validatedData.sellPrice ?? null;
    if ("profitLoss" in validatedData)
      updateData.profitLoss = validatedData.profitLoss ?? null;
    if ("sellReason" in validatedData)
      updateData.sellReason = validatedData.sellReason ?? null;
    if ("transactionStatus" in validatedData)
      updateData.transactionStatus = validatedData.transactionStatus ?? null;
    if ("description" in validatedData)
      updateData.description = validatedData.description ?? null;

    // Update asset with only provided fields
    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error updating asset:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
