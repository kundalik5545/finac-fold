import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { goalFormSchema } from "@/lib/schema/goals-schema";
import { ZodError } from "zod";
import { getGoals, createGoal } from "@/action/goals";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await getGoals(session.user.id);

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
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
    console.log("Received request body:", body);

    // Validate data with schema
    let validatedData;
    try {
      validatedData = goalFormSchema.parse(body);
      console.log("Validated data:", validatedData);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.issues },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Convert date string to Date object
    const targetDate =
      validatedData.targetDate instanceof Date
        ? validatedData.targetDate
        : new Date(validatedData.targetDate);

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid target date" },
        { status: 400 }
      );
    }

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value: string | null | undefined): string | null => {
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

    // Prepare goal data
    const goalData = {
      name: validatedData.name.trim(),
      targetAmount: validatedData.targetAmount,
      currentAmount: validatedData.currentAmount || 0,
      targetDate: targetDate,
      description: toNullIfEmpty(validatedData.description),
      icon: toNullIfEmpty(validatedData.icon),
      color: toNullIfEmpty(validatedData.color),
    };

    console.log("Prepared goal data:", goalData);

    // Create goal
    const goal = await createGoal(goalData, session.user.id);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create goal: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
