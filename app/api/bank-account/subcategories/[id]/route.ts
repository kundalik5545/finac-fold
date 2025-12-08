import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateSubCategorySchema } from "@/lib/schema/bank-account-schema";
import { ZodError } from "zod";
import { updateSubCategory, deleteSubCategory } from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * PATCH /api/bank-account/subcategories/[id]
 * Update a subcategory
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
    const validatedData = updateSubCategorySchema.parse(body);

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
    if ("categoryId" in validatedData)
      updateData.categoryId = validatedData.categoryId;
    if ("color" in validatedData)
      updateData.color = toNullIfEmpty(validatedData.color);
    if ("icon" in validatedData)
      updateData.icon = toNullIfEmpty(validatedData.icon);

    const subCategory = await updateSubCategory(
      id,
      updateData,
      session.user.id
    );

    return NextResponse.json({ subCategory }, { status: StatusScode.OK });
  } catch (error) {
    console.error("Error updating subcategory:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "Subcategory not found") {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/bank-account/subcategories/[id]
 * Delete a subcategory
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

    await deleteSubCategory(id, session.user.id);

    return NextResponse.json(
      { message: "Subcategory deleted successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error deleting subcategory:", error);

    if (error instanceof Error && error.message === "Subcategory not found") {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: StatusScode.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
