import { auth } from "@/lib/auth";
import { updateGoalSchema } from "@/lib/goals-schema";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getGoal, updateGoal, deleteGoal } from "@/action/goals";

type ParamsType = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const goal = await getGoal(id, session.user.id);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Error fetching goal:", error);

    if (error instanceof Error && error.message === "Goal not found") {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch goal" },
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

    const { id } = await params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateGoalSchema.parse(body);

    // Prepare update object
    const updateData: Record<string, any> = {};
    if ("name" in validatedData) updateData.name = validatedData.name;
    if ("targetAmount" in validatedData)
      updateData.targetAmount = validatedData.targetAmount;
    if ("currentAmount" in validatedData)
      updateData.currentAmount = validatedData.currentAmount;
    if ("targetDate" in validatedData && validatedData.targetDate !== undefined) {
      const targetDate =
        validatedData.targetDate instanceof Date
          ? validatedData.targetDate
          : new Date(validatedData.targetDate);
      updateData.targetDate = targetDate;
    }
    if ("description" in validatedData)
      updateData.description = validatedData.description ?? null;
    if ("icon" in validatedData) updateData.icon = validatedData.icon ?? null;
    if ("color" in validatedData)
      updateData.color = validatedData.color ?? null;

    const goal = await updateGoal(id, updateData, session.user.id);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Error updating goal:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Goal not found") {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update goal" },
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

    const { id } = await params;

    await deleteGoal(id, session.user.id);

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);

    if (error instanceof Error && error.message === "Goal not found") {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}

