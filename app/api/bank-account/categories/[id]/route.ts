import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateCategorySchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import { updateCategory, deleteCategory } from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * PATCH /api/bank-account/categories/[id]
 * Update a category
 */
export async function PATCH(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input with zod schema
    const validatedData = updateCategorySchema.parse(body);

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

    // Prepare update object
    const updateData: Record<string, any> = {};
    if ("name" in validatedData) updateData.name = validatedData.name?.trim();
    if ("type" in validatedData) updateData.type = validatedData.type;
    if ("color" in validatedData)
      updateData.color = toNullIfEmpty(validatedData.color);
    if ("icon" in validatedData)
      updateData.icon = toNullIfEmpty(validatedData.icon);

    const category = await updateCategory(id, updateData, session.user.id);

    return NextResponse.json({ category }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/bank-account/categories/[id]
 * Delete a category
 */
export async function DELETE(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { id } = await params;

    await deleteCategory(id, session.user.id);

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: StatusScode.NOT_FOUND }
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
