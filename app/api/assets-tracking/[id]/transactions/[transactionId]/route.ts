import { auth } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/assets-tracking-schema";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { updateTransaction, deleteTransaction } from "@/action/assets-tracking";

type ParamsType = { params: { id: string; transactionId: string } };

export async function PATCH(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateTransactionSchema.parse(body);

    // Prepare update object
    const updateData: Record<string, any> = {};
    if ("value" in validatedData) updateData.value = validatedData.value;
    if ("date" in validatedData && validatedData.date !== undefined) {
      const date =
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date);
      updateData.date = date;
    }
    if ("notes" in validatedData)
      updateData.notes = validatedData.notes ?? null;

    const transaction = await updateTransaction(
      transactionId,
      updateData,
      session.user.id
    );

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error updating transaction:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update transaction" },
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

    const { transactionId } = await params;

    await deleteTransaction(transactionId, session.user.id);

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);

    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
