import { auth } from "@/lib/auth";
import { updateAssetSchema } from "@/lib/assets-tracking-schema";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAsset, updateAsset, deleteAsset } from "@/action/assets-tracking";

type ParamsType = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const asset = await getAsset(id, session.user.id);

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error fetching asset:", error);

    if (error instanceof Error && error.message === "Asset not found") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

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

    // Prepare update object
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

    const asset = await updateAsset(id, updateData, session.user.id);

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error updating asset:", error);

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

    await deleteAsset(id, session.user.id);

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);

    if (error instanceof Error && error.message === "Asset not found") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
