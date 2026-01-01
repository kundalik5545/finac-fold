import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createSubscription } from "@/action/subscriptions";
import { subscriptionFormSchema } from "@/lib/subscriptions-schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = subscriptionFormSchema.parse(body);

    const subscription = await createSubscription(
      {
        name: validatedData.name,
        amount: validatedData.amount,
        frequency: validatedData.frequency,
        startDate: new Date(validatedData.startDate),
        nextDueDate: new Date(validatedData.nextDueDate),
        icon: validatedData.icon,
        color: validatedData.color,
        description: validatedData.description,
        isActive: true,
      },
      session.user.id
    );

    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

