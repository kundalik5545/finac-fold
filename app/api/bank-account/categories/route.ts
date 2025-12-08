import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { categoryFormSchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import { getCategories, createCategory } from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";

/**
 * GET /api/bank-account/categories
 * Fetch all categories for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const categories = await getCategories(session.user.id);

    return NextResponse.json({ categories }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/bank-account/categories
 * Create a new category
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const body = await request.json();

    // Validate data with schema
    let validatedData;
    try {
      validatedData = categoryFormSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.issues },
          { status: StatusScode.BAD_REQUEST }
        );
      }
      throw validationError;
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

    // Prepare category data
    const categoryData = {
      name: validatedData.name.trim(),
      type: validatedData.type,
      color: toNullIfEmpty(validatedData.color),
      icon: toNullIfEmpty(validatedData.icon),
    };

    // Create category
    const category = await createCategory(categoryData, session.user.id);

    return NextResponse.json({ category }, { status: StatusScode.CREATED });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
