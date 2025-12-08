import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { subCategoryFormSchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import { getSubCategories, createSubCategory } from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

/**
 * GET /api/bank-account/subcategories
 * Fetch all subcategories (optionally filtered by categoryId)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (categoryId) {
      const subCategories = await getSubCategories(categoryId, session.user.id);
      return NextResponse.json({ subCategories }, { status: StatusScode.OK });
    }

    // If no categoryId, return all subcategories for user
    const subCategories = await getSubCategories("", session.user.id);
    return NextResponse.json({ subCategories }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/bank-account/subcategories
 * Create a new subcategory
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
      validatedData = subCategoryFormSchema.parse(body);
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

    // Prepare subcategory data
    const subCategoryData = {
      name: validatedData.name.trim(),
      categoryId: validatedData.categoryId,
      color: toNullIfEmpty(validatedData.color),
      icon: toNullIfEmpty(validatedData.icon),
    };

    // Create subcategory
    const subCategory = await createSubCategory(
      subCategoryData,
      session.user.id
    );

    return NextResponse.json({ subCategory }, { status: StatusScode.CREATED });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    // Extract error message from the error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : undefined,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
