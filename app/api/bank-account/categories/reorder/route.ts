import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { reorderCategories } from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import { z } from "zod";

const reorderSchema = z.object({
  categoryOrders: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

/**
 * POST /api/bank-account/categories/reorder
 * Reorder categories
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
    const validatedData = reorderSchema.parse(body);

    await reorderCategories(validatedData.categoryOrders, session.user.id);

    return NextResponse.json(
      { message: "Categories reordered successfully" },
      { status: StatusScode.OK }
    );
  } catch (error) {
    console.error("Error reordering categories:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: StatusScode.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to reorder categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
