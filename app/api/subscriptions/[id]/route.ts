import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  deleteSubscription,
  getSubscription,
  updateSubscription,
} from "@/action/subscriptions";
import { subscriptionFormSchema } from "@/lib/subscriptions-schema";
import { ZodError } from "zod";

type ParamsType = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const subscription = await getSubscription(id, session.user.id);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);

    if (error instanceof Error && error.message === "Subscription not found") {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch subscription" },
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
    const validatedData = subscriptionFormSchema.parse(body);

    // Prepare update object
    const updateData: Record<string, any> = {};
    if ("name" in validatedData) updateData.name = validatedData.name;
    if ("amount" in validatedData) updateData.amount = validatedData.amount;
    if ("frequency" in validatedData)
      updateData.frequency = validatedData.frequency;
    if ("startDate" in validatedData && validatedData.startDate !== undefined) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (
      "nextDueDate" in validatedData &&
      validatedData.nextDueDate !== undefined
    ) {
      updateData.nextDueDate = new Date(validatedData.nextDueDate);
    }
    if ("description" in validatedData)
      updateData.description = validatedData.description ?? null;
    if ("icon" in validatedData) updateData.icon = validatedData.icon ?? null;
    if ("color" in validatedData)
      updateData.color = validatedData.color ?? null;

    const subscription = await updateSubscription(
      id,
      updateData,
      session.user.id
    );

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error updating subscription:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Subscription not found") {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update subscription" },
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

    await deleteSubscription(id, session.user.id);

    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);

    if (error instanceof Error && error.message === "Subscription not found") {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
